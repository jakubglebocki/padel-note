"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, startOfToday, getISOWeek } from "date-fns";
import { pl } from "date-fns/locale";

interface WeekNavigationProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
}

export function WeekNavigation({ currentWeekStart, onWeekChange }: WeekNavigationProps) {
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const goToPreviousWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const goToThisWeek = () => {
    const today = startOfToday();
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    onWeekChange(thisWeekStart);
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    onWeekChange(weekStart);
  };

  const weekNumber = getISOWeek(currentWeekStart);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Week Range Display */}
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <span className="text-lg font-semibold">
          {format(currentWeekStart, "d MMM", { locale: pl })} - {format(weekEnd, "d MMM yyyy", { locale: pl })}
          <span className="ml-2 text-muted-foreground text-base">(Tydzień {weekNumber})</span>
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          className="h-9"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Poprzedni
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToThisWeek}
          className="h-9"
        >
          Ten tydzień
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          className="h-9"
        >
          Następny
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Date Picker removed per request */}
    </div>
  );
}

