# 🔄 System Statusów i Anulowania Aktywności

## 📋 Przegląd

Zaimplementowany system statusów aktywności z możliwością anulowania i wymaganiem akceptacji trenera dla treningów indywidualnych i grupowych.

---

## ✨ Nowe Funkcje

### 1. **Statusy Aktywności**

Każda aktywność ma teraz jeden z czterech statusów:

| Status | Opis | Kolor | Ikona |
|--------|------|-------|-------|
| `scheduled` | Zaplanowana | 💙 `#0EA5E9` (info) | - |
| `pending_approval` | Oczekuje na akceptację trenera | 🟡 `#FBBF24` (warning) | 🕐 Clock |
| `confirmed` | Potwierdzona przez trenera | 💚 `#00D9B4` (success) | ✅ CheckCircle2 |
| `cancelled` | Anulowana | ⚪ `#6B7280` (gray) | ❌ XCircle |

### 2. **Automatyczne Ustawianie Statusu**

```typescript
// Treningi z trenerem → wymaga akceptacji
individual_training → status: "pending_approval"
group_training → status: "pending_approval"

// Pozostałe typy → od razu zaplanowane
sparring → status: "scheduled"
league_match → status: "scheduled"
// ... itd.
```

### 3. **Wymaganie Akceptacji Trenera**

Dwa typy treningów wymagają akceptacji trenera:

#### **Trening indywidualny (Trener)**
- `requiresTrainerApproval: true`
- Status początkowy: `pending_approval`
- Badge: "Oczekuje na akceptację trenera"

#### **Trening grupowy (Trener)**
- `requiresTrainerApproval: true`
- Status początkowy: `pending_approval`
- Badge: "Oczekuje na akceptację trenera"

### 4. **Anulowanie Aktywności**

#### Przycisk "Anuluj aktywność"
- Pojawia się w modalu edycji
- Dostępny tylko dla aktywności NIE anulowanych
- Kolor: warning (żółty)

#### Dla pojedynczej aktywności:
```
1. Kliknij na aktywność
2. Kliknij "Anuluj aktywność"
3. Status zmienia się na "cancelled"
4. Aktywność staje się szara z przekreślonym tekstem
```

#### Dla serii powtarzających się:
```
1. Kliknij na aktywność z serii
2. Kliknij "Anuluj aktywność"
3. Dialog: "Anulować całą serię?"
   - OK: Anuluje wszystkie w serii
   - Anuluj: Anuluje tylko tę jedną
```

### 5. **Wizualne Oznaczenia**

#### Anulowana aktywność:
- ✅ Opacity 60%
- ✅ Szary kolor (zamiast koloru typu)
- ✅ Przekreślony tekst
- ✅ Brak drag & drop
- ✅ Badge z ikoną XCircle

#### Oczekująca na akceptację:
- ✅ Normalny kolor typu
- ✅ Badge z ikoną Clock (żółty)
- ✅ Alert w modalu

#### Potwierdzona:
- ✅ Normalny kolor typu
- ✅ Badge z ikoną CheckCircle2 (zielony)

---

## 🎨 UI/UX Zmiany

### Modal Dodawania/Edycji

#### Usunięte:
- ❌ Pole "Intensywność" (slider 1-10)

#### Dodane:
- ✅ Informacja o wymaganiu akceptacji trenera (dla typów z trenerem)
- ✅ Wyświetlanie aktualnego statusu (w trybie edycji)
- ✅ Przycisk "Anuluj aktywność" (obok "Usuń")
- ✅ Ukrycie przycisku "Zapisz" dla anulowanych aktywności

### Karta Aktywności

#### Anulowana:
```tsx
<ActivityCard 
  activity={activity}
  // Widoczne zmiany:
  // - Szary kolor
  // - Przekreślony tytuł
  // - Opacity 60%
  // - Brak drag handle
  // - Badge "Anulowana"
/>
```

#### Z statusem:
```tsx
<ActivityCard 
  activity={activity}
  // Badge pokazuje status:
  // - Ikona odpowiednia dla statusu
  // - Kolor odpowiedni dla statusu
  // - Tekst statusu
/>
```

---

## 🏗️ Architektura Kodu

### Nowe Typy

```typescript
export type ActivityStatus = 
  | "scheduled"
  | "pending_approval"
  | "confirmed"
  | "cancelled";

export interface Activity {
  // ... existing fields
  status: ActivityStatus; // NOWE
  // ... rest
}

export interface ActivityTypeConfig {
  // ... existing fields
  requiresTrainerApproval: boolean; // NOWE
  // ... rest
}
```

### Nowe Funkcje Pomocnicze

```typescript
// Określ początkowy status na podstawie typu
getInitialStatus(activityType: ActivityType): ActivityStatus

// Pobierz label dla statusu
getStatusLabel(status: ActivityStatus): string

// Pobierz kolor dla statusu
getStatusColor(status: ActivityStatus): string
```

### Nowe Handlery

```typescript
// W PlanPage
const handleCancelActivity = (activityId: string) => {
  // Logika anulowania aktywności
  // Obsługa serii vs pojedyncza
}

// W AddActivityModal
const handleCancelActivity = () => {
  // Wywołanie onCancel callback
}
```

---

## 📊 Przepływ Statusów

```
┌─────────────────────────────────────────────────┐
│         Tworzenie Aktywności                    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Typ z trenerem?       │
        └───────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
    TAK             NIE
        │               │
        ▼               ▼
pending_approval    scheduled
        │               │
        │               │
┌───────┴───────┐       │
│ Trener        │       │
│ akceptuje     │       │
└───────────────┘       │
        │               │
        ▼               │
    confirmed           │
        │               │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ Użytkownik    │
        │ anuluje       │
        └───────────────┘
                │
                ▼
            cancelled
                │
                ▼
        (nie można cofnąć)
```

---

## 🎯 Przypadki Użycia

### Przypadek 1: Dodanie treningu z trenerem

```
1. Użytkownik: Dodaje "Trening indywidualny (Trener)"
   → Status: pending_approval
   → Alert: "Wymaga akceptacji trenera"
   → Badge: "Oczekuje na akceptację trenera" (żółty)

2. [SYMULACJA] Trener: Akceptuje
   → Status: confirmed
   → Badge: "Potwierdzona przez trenera" (zielony)

3. Użytkownik: Widzi potwierdzony trening
   → Może edytować, anulować lub usunąć
```

### Przypadek 2: Dodanie sparingu

```
1. Użytkownik: Dodaje "Sparing"
   → Status: scheduled
   → Brak alertu o treningu
   → Brak badge (domyślny status)

2. Użytkownik: Może od razu korzystać
   → Drag & drop działa
   → Może edytować, anulować lub usunąć
```

### Przypadek 3: Anulowanie pojedynczej aktywności

```
1. Użytkownik: Otwiera aktywność
2. Użytkownik: Klika "Anuluj aktywność"
3. System: Zmienia status na cancelled
4. Wynik:
   → Aktywność szara z przekreśleniem
   → Brak drag & drop
   → Badge: "Anulowana"
   → Nie można już edytować
```

### Przypadek 4: Anulowanie serii

```
1. Użytkownik: Otwiera aktywność z serii
2. Użytkownik: Klika "Anuluj aktywność"
3. System: Dialog "Anulować całą serię?"
4a. Użytkownik: OK (całą serię)
    → Wszystkie aktywności z tym recurringId → cancelled
4b. Użytkownik: Anuluj (tylko tę)
    → Tylko ta aktywność → cancelled
```

---

## 🔐 Reguły Biznesowe

### Statusy

1. **Aktywność nie może zmienić statusu z `cancelled`**
   - Anulowana aktywność jest ostateczna
   - Można tylko usunąć (Delete)

2. **Tylko treningi z trenerem wymagają akceptacji**
   - `individual_training` → `pending_approval`
   - `group_training` → `pending_approval`
   - Reszta → `scheduled`

3. **Anulowana aktywność jest read-only**
   - Nie można edytować
   - Nie można przeciągać
   - Przycisk "Zapisz" ukryty
   - Tylko opcja usunięcia

### Anulowanie

1. **Anulowanie zachowuje aktywność w systemie**
   - Nie usuwa z listy
   - Tylko zmienia status
   - Nadal widoczna (szara)

2. **Usunięcie vs Anulowanie**
   - **Usuń**: Całkowicie usuwa z listy
   - **Anuluj**: Zachowuje, ale oznacza jako nieaktywną

3. **Seria aktywności**
   - Dialog potwierdza intencję (seria vs pojedyncza)
   - Można anulować tylko część serii
   - Anulowanie serii = anulowanie wszystkich z tym samym recurringId

---

## 📈 Metryki i Statystyki

### Liczenie aktywności

Anulowane aktywności:
- ❌ Nie liczą się do "Aktywności w tygodniu"
- ❌ Nie liczą się do "Łączny czas"
- ❌ Nie liczą się do "Średnia intensywność"

Oczekujące na akceptację:
- ✅ Liczą się do statystyk
- ⚠️ Można dodać specjalne oznaczenie

Potwierdzone i Zaplanowane:
- ✅ Normalnie liczą się do wszystkich statystyk

---

## 🎨 Kolory Statusów

```css
/* scheduled - niebieski */
--status-scheduled: #0EA5E9;

/* pending_approval - żółty */
--status-pending: #FBBF24;

/* confirmed - zielony */
--status-confirmed: #00D9B4;

/* cancelled - szary */
--status-cancelled: #6B7280;
```

---

## 🚀 Jak Używać

### Anulowanie aktywności

```
Krok 1: Kliknij na aktywność
Krok 2: W modalu kliknij "Anuluj aktywność" (żółty przycisk)
Krok 3: Dla serii: Wybierz opcję w dialogu
Krok 4: Aktywność zostanie anulowana (szara)
```

### Sprawdzanie statusu

```
Sposób 1: Badge na karcie
  → Widoczny dla pending/confirmed/cancelled

Sposób 2: W modalu edycji
  → Sekcja "Status aktywności"
  → Kolorowy badge

Sposób 3: Wizualnie
  → Anulowana: szara, przekreślona
  → Pending: żółty badge z zegarem
  → Confirmed: zielony badge z checkmarkiem
```

---

## 🐛 Known Issues / TODOs

### Obecnie
- ✅ Statusy zaimplementowane
- ✅ Anulowanie działa
- ✅ Wizualne oznaczenia OK
- ✅ Seria vs pojedyncza OK

### Do rozważenia w przyszłości
- [ ] **Symulacja akceptacji trenera** - obecnie tylko ręcznie
- [ ] **Przywracanie anulowanych** - "Cofnij anulowanie"
- [ ] **Historia zmian statusu** - Audit log
- [ ] **Powiadomienia** - Email/Push o zmianie statusu
- [ ] **Komentarze trenera** - Dlaczego zaakceptował/odrzucił
- [ ] **Filtrowanie po statusie** - Widok tylko pending/confirmed
- [ ] **Statystyki statusów** - % pending vs confirmed

---

## 📚 API Reference

### `getInitialStatus()`
```typescript
function getInitialStatus(activityType: ActivityType): ActivityStatus
```
**Przykład:**
```typescript
getInitialStatus("individual_training") // → "pending_approval"
getInitialStatus("sparring")            // → "scheduled"
```

### `getStatusLabel()`
```typescript
function getStatusLabel(status: ActivityStatus): string
```
**Przykład:**
```typescript
getStatusLabel("pending_approval") // → "Oczekuje na akceptację trenera"
getStatusLabel("cancelled")        // → "Anulowana"
```

### `getStatusColor()`
```typescript
function getStatusColor(status: ActivityStatus): string
```
**Przykład:**
```typescript
getStatusColor("pending_approval") // → "#FBBF24"
getStatusColor("confirmed")        // → "#00D9B4"
```

---

## ✅ Checklist Implementacji

- [x] Definicja typów statusów
- [x] Pole status w Activity
- [x] requiresTrainerApproval w config
- [x] getInitialStatus()
- [x] getStatusLabel()
- [x] getStatusColor()
- [x] ActivityCard z wizualizacją statusu
- [x] AddActivityModal - usunięte intensywność
- [x] AddActivityModal - info o wymaganiu akceptacji
- [x] AddActivityModal - badge statusu
- [x] AddActivityModal - przycisk "Anuluj aktywność"
- [x] PlanPage - handleCancelActivity
- [x] PlanPage - obsługa serii vs pojedyncza
- [x] Dokumentacja

---

## 🎉 Gotowe!

System statusów i anulowania jest w pełni funkcjonalny i gotowy do użycia.

**Następny krok**: Integracja z backendem (Supabase) dla persystencji statusów.

---

**Wersja**: 1.0  
**Data**: 8 stycznia 2025  
**Status**: ✅ Zaimplementowane  
**Zmiany**: Usunięta intensywność, dodane statusy i anulowanie

