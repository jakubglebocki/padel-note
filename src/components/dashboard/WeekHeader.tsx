"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Calendar, Target } from "lucide-react";
import { formatPercent } from "@/lib/metrics/percent";

export interface WeekHeaderProps {
  weekStart: string;
  weekEnd: string;
  today: string;
  percentDone: number; // 0..1
  onPrevWeek(): void;
  onThisWeek(): void;
  onNextWeek(): void;
  onGoToPlan(): void;
}

export function WeekHeader({
  weekStart,
  weekEnd,
  today,
  percentDone,
  onPrevWeek,
  onThisWeek,
  onNextWeek,
  onGoToPlan,
}: WeekHeaderProps) {
  // Formatuj daty
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatWeekRange = () => {
    const start = formatDate(weekStart);
    const end = formatDate(weekEnd);
    return `${start} - ${end}`;
  };

  // Sprawdź czy to bieżący tydzień
  const isCurrentWeek = () => {
    const todayDate = new Date(today);
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekEnd);
    return todayDate >= weekStartDate && todayDate <= weekEndDate;
  };

  // Oblicz numer tygodnia
  const getWeekNumber = () => {
    const startDate = new Date(weekStart);
    const yearStart = new Date(startDate.getFullYear(), 0, 1);
    const days = Math.floor((startDate.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + yearStart.getDay() + 1) / 7);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Lewa strona - Informacje o tygodniu */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[var(--color-accent-blue)]" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Tydzień {getWeekNumber()}
                </h1>
                <p className="text-muted-foreground">
                  {formatWeekRange()}
                  {isCurrentWeek() && (
                    <span className="ml-2 text-sm bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                      Bieżący
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Procent realizacji planu */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Realizacja planu
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatPercent(percentDone)}
                  </span>
                </div>
                <Progress 
                  value={percentDone * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* Prawa strona - Sterowanie i CTA */}
          <div className="flex flex-col gap-4">
            {/* Sterowanie tygodniami */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevWeek}
                aria-label="Poprzedni tydzień"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onThisWeek}
                className="min-w-[80px]"
              >
                Dziś
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onNextWeek}
                aria-label="Następny tydzień"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* CTA - Przejdź do planu */}
            <Button
              onClick={onGoToPlan}
              className="btn-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              size="lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Przejdź do planu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
