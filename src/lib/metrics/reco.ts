/**
 * System rekomendacji na podstawie metryk treningowych
 */

export interface Recommendation {
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: 'load' | 'readiness' | 'plan' | 'general';
}

export interface RecommendationInputs {
  acwr: number;
  chronic: number;
  sum7: number;
  readiness: number;
  planPercent: number;
  hasData: boolean;
  previousWeekSum7?: number;
}

/**
 * Generuje rekomendacje na podstawie metryk
 */
export function generateRecommendations(inputs: RecommendationInputs): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Brak danych
  if (!inputs.hasData) {
    recommendations.push({
      text: 'Brak danych w okresie - rozpocznij notowanie aktywności',
      priority: 'low',
      category: 'general'
    });
    return recommendations;
  }
  
  // Chronic load = 0
  if (inputs.chronic === 0) {
    recommendations.push({
      text: 'Brak bazy treningowej (C=0) - buduj obciążenie stopniowo',
      priority: 'high',
      category: 'load'
    });
    return recommendations;
  }
  
  // ACWR > 1.5 - Wysokie obciążenie
  if (inputs.acwr > 1.5) {
    recommendations.push({
      text: 'Wysokie obciążenie - rozważ 1-2 dni regeneracji',
      priority: 'high',
      category: 'load'
    });
  }
  
  // ACWR 1.3-1.5 - Podwyższone ryzyko
  if (inputs.acwr >= 1.3 && inputs.acwr <= 1.5) {
    recommendations.push({
      text: 'Podwyższone ryzyko - monitoruj objawy, skróć intensywność',
      priority: 'medium',
      category: 'load'
    });
  }
  
  // ACWR < 0.8 - Niska stymulacja
  if (inputs.acwr < 0.8) {
    const priority = inputs.chronic < 50 ? 'medium' : 'low';
    recommendations.push({
      text: 'Niska stymulacja - zwiększ bodźce lub objętość treningową',
      priority,
      category: 'load'
    });
  }
  
  // Gotowość < 4
  if (inputs.readiness < 4) {
    recommendations.push({
      text: 'Niska gotowość - skup się na regeneracji i lekkiej technice',
      priority: 'high',
      category: 'readiness'
    });
  }
  
  // Gotowość 4-6.9
  if (inputs.readiness >= 4 && inputs.readiness < 7) {
    recommendations.push({
      text: 'Średnia gotowość - dostosuj intensywność do samopoczucia',
      priority: 'medium',
      category: 'readiness'
    });
  }
  
  // Ostrzeżenie o wzroście obciążenia >30%
  if (inputs.previousWeekSum7 && inputs.previousWeekSum7 > 0) {
    const growthPercent = ((inputs.sum7 - inputs.previousWeekSum7) / inputs.previousWeekSum7) * 100;
    if (growthPercent > 30) {
      recommendations.push({
        text: `Ostrzeżenie: obciążenie wzrosło o ${Math.round(growthPercent)}% - rozważ redukcję`,
        priority: 'medium',
        category: 'load'
      });
    }
  }
  
  // Realizacja planu < 50%
  if (inputs.planPercent < 0.5) {
    recommendations.push({
      text: 'Niska realizacja planu - przeanalizuj przyczyny i dostosuj cele',
      priority: 'medium',
      category: 'plan'
    });
  }
  
  // Realizacja planu > 90%
  if (inputs.planPercent > 0.9) {
    recommendations.push({
      text: 'Doskonała realizacja planu - utrzymaj obecne tempo',
      priority: 'low',
      category: 'plan'
    });
  }
  
  // Domyślna rekomendacja jeśli brak innych
  if (recommendations.length === 0) {
    recommendations.push({
      text: 'Wszystkie metryki w normie - kontynuuj obecny plan treningowy',
      priority: 'low',
      category: 'general'
    });
  }
  
  // Sortuj według priorytetu
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Formatuje priorytet do wyświetlania
 */
export function formatPriority(priority: Recommendation['priority']): {
  label: string;
  color: 'danger' | 'warning' | 'success';
} {
  switch (priority) {
    case 'high':
      return { label: 'Wysoki', color: 'danger' };
    case 'medium':
      return { label: 'Średni', color: 'warning' };
    case 'low':
      return { label: 'Niski', color: 'success' };
  }
}

/**
 * Formatuje kategorię do wyświetlania
 */
export function formatCategory(category: Recommendation['category']): string {
  switch (category) {
    case 'load':
      return 'Obciążenie';
    case 'readiness':
      return 'Gotowość';
    case 'plan':
      return 'Plan';
    case 'general':
      return 'Ogólne';
  }
}
