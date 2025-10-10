# 🔄 Automatyczne Statusy i Centrowanie - Plan Tygodniowy

## 📋 Przegląd

Zaimplementowano automatyczne centrowanie na obecną godzinę oraz inteligentny system statusów aktywności, który automatycznie zmienia status na podstawie czasu.

---

## ✨ Nowe Funkcje

### 1. **Automatyczne Centrowanie na Obecną Godzinę**

#### Funkcjonalność:
- ✅ **Auto-scroll przy ładowaniu** - Siatka automatycznie przewija się do obecnej godziny
- ✅ **Aktualizacja co minutę** - Pozycja przewijania dostosowuje się do aktualnego czasu
- ✅ **Offset dla lepszej widoczności** - Linia czasu jest widoczna z marginesem
- ✅ **Tylko w zakresie godzin** - Centrowanie działa tylko gdy aktualna godzina jest w zakresie 06:00-23:00

#### Implementacja:
```typescript
// Auto-scroll to current time when component mounts or current time changes
useEffect(() => {
  if (!autoScrollToCurrentTime) return;
  
  const now = currentTime;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Check if current time is within the grid range
  if (currentHour < startHour || currentHour > endHour) return;
  
  // Calculate scroll position
  const rowHeight = 48; // Height of one 30-min slot in pixels
  const slotsPerHour = 60 / slotStepMinutes;
  
  const minutesInCurrentHour = currentMinute;
  const positionInHour = minutesInCurrentHour / 60;
  const positionInSlots = positionInHour * slotsPerHour;
  
  const hoursFromStart = currentHour - startHour;
  const totalPositionInSlots = (hoursFromStart * slotsPerHour) + positionInSlots;
  
  const scrollPosition = totalPositionInSlots * rowHeight;
  
  // Find the scrollable container and scroll to position
  const scrollContainer = document.querySelector('.overflow-auto');
  if (scrollContainer) {
    scrollContainer.scrollTop = Math.max(0, scrollPosition - 200); // Offset for better visibility
  }
}, [currentTime, startHour, endHour, slotStepMinutes, autoScrollToCurrentTime]);
```

### 2. **Inteligentny System Statusów**

#### Nowe statusy:
| Status | Opis | Kolor | Ikona | Kiedy się pojawia |
|--------|------|-------|-------|------------------|
| `scheduled` | Zaplanowana | 💙 `#0EA5E9` | - | Domyślnie dla nowych aktywności |
| `pending_approval` | Oczekuje na akceptację trenera | 🟡 `#FBBF24` | 🕐 Clock | Treningi z trenerem |
| `confirmed` | Potwierdzona przez trenera | 💚 `#00D9B4` | ✅ CheckCircle2 | Po akceptacji trenera |
| `in_progress` | W trakcie | 🧡 `#FF6B35` | ▶️ Play | **AUTOMATYCZNIE** gdy data i godzina już minęła |
| `completed` | Zrealizowana | 💚 `#10B981` | ✅ CheckCircle | Po zaznaczeniu przez użytkownika |
| `cancelled` | Anulowana | ⚪ `#6B7280` | ❌ XCircle | Po anulowaniu przez użytkownika |

#### Automatyczne zmiany statusu:

```typescript
export function getAutoStatus(activity: Activity, currentTime: Date = new Date()): ActivityStatus {
  // Don't override completed or cancelled activities
  if (activity.status === 'completed' || activity.status === 'cancelled') {
    return activity.status;
  }
  
  // Check if activity is in the past
  if (isActivityInPast(activity, currentTime) && isActivityToday(activity, currentTime)) {
    return 'in_progress';
  }
  
  // Return the original status for future activities
  return activity.status;
}
```

#### Logika określania statusu:
1. **Zakończone i anulowane** - Nigdy nie zmieniają statusu automatycznie
2. **Aktywności z dzisiaj** - Sprawdzane czy godzina już minęła
3. **Aktywności z przyszłości** - Zachowują oryginalny status
4. **Aktualizacja w czasie rzeczywistym** - Co minutę sprawdzane są statusy

### 3. **Przycisk "Zrealizuj i oceń"**

#### Dla aktywności w statusie "in_progress":
- ✅ **Zielony alert** - Informuje że trening się zakończył
- ✅ **Przycisk "Zrealizuj i oceń"** - Pozwala oznaczyć aktywność jako zrealizowaną
- ✅ **Automatyczne ukrywanie** - Przyciski edycji są ukrywane dla zrealizowanych aktywności
- ✅ **Status "completed"** - Po kliknięciu aktywność otrzymuje status zrealizowana

#### UI/UX:
```typescript
{/* Complete Activity Button for in_progress activities */}
{editActivity && actualStatus === "in_progress" && (
  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-success mb-2">
          Trening zakończony
        </h4>
        <p className="text-xs text-success/80 mb-3">
          Jeśli ukończyłeś ten trening, możesz go oznaczyć jako zrealizowany i dodać ocenę.
        </p>
        <Button
          onClick={handleCompleteActivity}
          className="bg-success hover:bg-success/90 text-white"
        >
          Zrealizuj i oceń
        </Button>
      </div>
    </div>
  </div>
)}
```

---

## 🎯 Przepływ Statusów

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
        │ Czas aktywności│
        │ już minął?    │
        └───────────────┘
                │
        ┌───────┴───────┐
        │               │
        ▼               ▼
    TAK             NIE
        │               │
        ▼               ▼
    in_progress    (zachowuje status)
        │
        ▼
┌───────────────┐
│ Użytkownik    │
│ klika         │
│ "Zrealizuj"   │
└───────────────┘
        │
        ▼
    completed
        │
        ▼
    (nie można już edytować)
```

---

## 🎨 Wizualne Zmiany

### Karty aktywności:

#### Status "in_progress":
```css
/* Pomarańczowy kolor */
color: #FF6B35;
icon: ▶️ Play
text: "W trakcie"
```

#### Status "completed":
```css
/* Zielony kolor */
color: #10B981;
icon: ✅ CheckCircle
text: "Zrealizowana"
```

### Modal edycji:

#### Dla aktywności "in_progress":
- ✅ **Zielony alert** - "Trening zakończony"
- ✅ **Przycisk "Zrealizuj i oceń"** - Zielony, prominentny
- ✅ **Ukryte przyciski** - "Zapisz" i "Anuluj" są ukryte

#### Dla aktywności "completed":
- ✅ **Tylko "Zamknij" i "Usuń"** - Nie można już edytować
- ✅ **Badge "Zrealizowana"** - Zielony z ikoną checkmark

---

## 🏗️ Implementacja Techniczna

### Nowe funkcje w `activity-types.ts`:

```typescript
// Helper functions for status determination
export function isActivityInPast(activity: Activity, currentTime: Date = new Date()): boolean {
  const activityDateTime = new Date(activity.date);
  const [hour, minute] = activity.startTime.split(':').map(Number);
  activityDateTime.setHours(hour, minute, 0, 0);
  
  return activityDateTime < currentTime;
}

export function isActivityToday(activity: Activity, currentTime: Date = new Date()): boolean {
  const activityDate = new Date(activity.date);
  const today = new Date(currentTime);
  
  return activityDate.toDateString() === today.toDateString();
}

export function getAutoStatus(activity: Activity, currentTime: Date = new Date()): ActivityStatus {
  // Don't override completed or cancelled activities
  if (activity.status === 'completed' || activity.status === 'cancelled') {
    return activity.status;
  }
  
  // Check if activity is in the past
  if (isActivityInPast(activity, currentTime) && isActivityToday(activity, currentTime)) {
    return 'in_progress';
  }
  
  // Return the original status for future activities
  return activity.status;
}
```

### Aktualizacje komponentów:

#### `ActivityCard.tsx`:
```typescript
// Get the actual status (auto-updated based on time)
const actualStatus = getAutoStatus(activity, currentTime);

// Status icon
const StatusIcon = isPendingApproval ? Clock : 
                   isConfirmed ? CheckCircle2 : 
                   isInProgress ? Play : 
                   isCompleted ? CheckCircle : 
                   isCancelled ? XCircle : null;
```

#### `WeeklyCalendarGrid.tsx`:
```typescript
// Auto-scroll to current time
useEffect(() => {
  // Calculate scroll position and scroll to it
}, [currentTime, startHour, endHour, slotStepMinutes, autoScrollToCurrentTime]);
```

#### `AddActivityModal.tsx`:
```typescript
// Get the actual status (auto-updated based on time)
const actualStatus = editActivity ? getAutoStatus(editActivity) : activityStatus;

// Complete Activity Button for in_progress activities
{editActivity && actualStatus === "in_progress" && (
  // Green alert with "Zrealizuj i oceń" button
)}
```

---

## 📊 Przypadki Użycia

### 1. **Automatyczne Centrowanie**

#### Scenariusz:
```
1. Użytkownik otwiera plan tygodniowy o 14:30
2. Siatka automatycznie przewija się do godziny 14:30
3. Linia czasu jest widoczna na środku ekranu
4. Użytkownik od razu widzi gdzie jest w czasie
```

#### Korzyści:
- ✅ **Szybka orientacja** - Nie trzeba szukać obecnej godziny
- ✅ **Lepszy UX** - Automatyczne przewijanie do istotnego miejsca
- ✅ **Aktualizacja w czasie rzeczywistym** - Pozycja dostosowuje się co minutę

### 2. **Automatyczne Statusy**

#### Scenariusz:
```
1. Użytkownik ma trening o 10:00-11:30
2. Aktualnie jest 12:00 (po treningu)
3. Aktywność automatycznie otrzymuje status "in_progress"
4. W karcie widoczny badge "W trakcie" z ikoną ▶️
5. Kliknięcie otwiera modal z przyciskiem "Zrealizuj i oceń"
```

#### Korzyści:
- ✅ **Automatyczna aktualizacja** - Nie trzeba ręcznie zmieniać statusu
- ✅ **Wizualne wskazówki** - Łatwe rozpoznanie zakończonych treningów
- ✅ **Gotowość do oceny** - Przycisk "Zrealizuj i oceń" jest widoczny

### 3. **Ocena Treningów**

#### Scenariusz:
```
1. Użytkownik kończy trening o 11:30
2. O 12:00 otwiera plan tygodniowy
3. Widzi aktywność ze statusem "W trakcie"
4. Kliknie na aktywność
5. Modal pokazuje alert "Trening zakończony"
6. Kliknie "Zrealizuj i oceń"
7. Aktywność otrzymuje status "Zrealizowana"
8. W przyszłości będzie modal z oceną
```

#### Korzyści:
- ✅ **Prosty przepływ** - Kliknięcie → Zrealizuj → Gotowe
- ✅ **Przygotowanie na ocenę** - System gotowy na dodanie modalu oceny
- ✅ **Historia** - Zrealizowane treningi są oznaczone i zachowane

---

## 🎯 Konfiguracja

### Auto-scroll:
```typescript
// W WeeklyCalendarGrid
autoScrollToCurrentTime = true  // Włącz/wyłącz auto-scroll
```

### Offset przewijania:
```typescript
// Offset dla lepszej widoczności linii czasu
scrollContainer.scrollTop = Math.max(0, scrollPosition - 200);
```

### Aktualizacja statusów:
```typescript
// Co minutę sprawdzane są statusy
setInterval(() => {
  setCurrentTime(new Date());
}, 60000);
```

---

## 🧪 Testowanie

### Scenariusze testowe:

#### 1. **Auto-scroll**
```
1. Otwórz plan tygodniowy w godzinach 06:00-23:00
2. Sprawdź czy siatka przewinęła się do obecnej godziny
3. Poczekaj 1-2 minuty
4. Sprawdź czy pozycja przewijania się zaktualizowała
```

#### 2. **Automatyczne statusy**
```
1. Dodaj aktywność na dzisiaj w przeszłości (np. 2 godziny temu)
2. Sprawdź czy ma status "W trakcie"
3. Sprawdź czy badge jest pomarańczowy z ikoną ▶️
4. Kliknij na aktywność
5. Sprawdź czy modal ma przycisk "Zrealizuj i oceń"
```

#### 3. **Przycisk zrealizuj**
```
1. Kliknij "Zrealizuj i oceń" na aktywności "in_progress"
2. Sprawdź czy aktywność otrzymała status "Zrealizowana"
3. Sprawdź czy badge jest zielony z ikoną ✅
4. Kliknij ponownie na aktywność
5. Sprawdź czy modal ma tylko "Zamknij" i "Usuń"
```

#### 4. **Statusy z trenerem**
```
1. Dodaj "Trening indywidualny (Trener)"
2. Sprawdź czy ma status "Oczekuje na akceptację trenera"
3. Symuluj akceptację trenera (zmień status ręcznie na "confirmed")
4. Sprawdź czy po czasie aktywność zmienia się na "in_progress"
```

---

## 🚀 Przyszłe Rozszerzenia

### Modal oceny treningu:
- [ ] **Formularz oceny** - Skala 1-10, notatki
- [ ] **Zapisywanie ocen** - W bazie danych
- [ ] **Statystyki** - Analiza ocen w czasie
- [ ] **Historia** - Przeglądanie poprzednich ocen

### Zaawansowane statusy:
- [ ] **"Oceniona"** - Po dodaniu oceny
- [ ] **"Częściowo zrealizowana"** - Dla długich aktywności
- [ ] **"Przerwana"** - Dla nieukończonych treningów

### Integracje:
- [ ] **Powiadomienia** - Przypomnienie o ocenie
- [ ] **Eksport** - Raporty z ocenami
- [ ] **Analiza** - Trendy i statystyki

---

## ✅ Checklist Implementacji

- [x] Automatyczne centrowanie na obecną godzinę
- [x] Nowe statusy: in_progress, completed
- [x] Automatyczne określanie statusu na podstawie czasu
- [x] Funkcje pomocnicze: isActivityInPast, isActivityToday, getAutoStatus
- [x] Aktualizacja ActivityCard z nowymi statusami
- [x] Przycisk "Zrealizuj i oceń" w modalu
- [x] Ukrywanie przycisków edycji dla zrealizowanych aktywności
- [x] Handler handleCompleteActivity
- [x] Aktualizacja kolorów i ikon statusów
- [x] Dokumentacja

---

## 🎉 Gotowe!

System automatycznych statusów i centrowania jest w pełni funkcjonalny i gotowy do użycia.

**Następny krok**: Implementacja modalu oceny treningu dla statusu "completed".

---

**Wersja**: 1.0  
**Data**: 8 stycznia 2025  
**Status**: ✅ Zaimplementowane  
**Funkcja**: Automatyczne statusy i centrowanie na obecną godzinę
