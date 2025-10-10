"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target
} from "lucide-react";
import { Recommendation, formatPriority, formatCategory } from "@/lib/metrics/reco";

export interface RecommendationsProps {
  items: Recommendation[];
  isLoading?: boolean;
}

const priorityIcons = {
  high: AlertTriangle,
  medium: Info,
  low: CheckCircle,
};

const categoryIcons = {
  load: TrendingUp,
  readiness: TrendingDown,
  plan: Target,
  general: Lightbulb,
};

const priorityColors = {
  high: 'bg-danger/10 border-danger/20 text-danger',
  medium: 'bg-warning/10 border-warning/20 text-warning',
  low: 'bg-success/10 border-success/20 text-success',
};

export function Recommendations({ items, isLoading = false }: RecommendationsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Rekomendacje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Rekomendacje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Brak rekomendacji - wszystkie metryki są w normie.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Rekomendacje
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sugestie na podstawie analizy Twoich metryk treningowych
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const PriorityIcon = priorityIcons[item.priority];
            const CategoryIcon = categoryIcons[item.category];
            const priorityInfo = formatPriority(item.priority);
            const categoryLabel = formatCategory(item.category);
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${priorityColors[item.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <PriorityIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed">
                      {item.text}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${priorityColors[item.priority]}`}
                      >
                        {priorityInfo.label}
                      </Badge>
                      
                      <div className="flex items-center gap-1 text-xs opacity-75">
                        <CategoryIcon className="h-3 w-3" />
                        <span>{categoryLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Podsumowanie */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {items.length} rekomendacj{items.length === 1 ? 'a' : items.length < 5 ? 'i' : 'i'}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-danger rounded-full"></div>
                <span>Wysoki</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span>Średni</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Niski</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
