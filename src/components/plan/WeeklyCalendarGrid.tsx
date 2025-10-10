"use client";

import React, { useState, useEffect } from "react";
import { Activity, generateTimeSlots, detectCollisions } from "@/lib/activity-types";
import { ActivityCard } from "./ActivityCard";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";

interface WeeklyCalendarGridProps {
  weekStart: Date;
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  onSlotClick: (date: Date, time: string) => void;
  onActivityDrop: (activity: Activity, newDate: Date, newTime: string) => void;
  startHour?: number;
  endHour?: number;
  slotStepMinutes?: number;
  autoScrollToCurrentTime?: boolean;
}

export function WeeklyCalendarGrid({
  weekStart,
  activities,
  onActivityClick,
  onSlotClick,
  onActivityDrop,
  startHour = 6,
  endHour = 23,
  slotStepMinutes = 30,
  autoScrollToCurrentTime = true,
}: WeeklyCalendarGridProps) {
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: Date; time: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

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

  const timeSlots = generateTimeSlots(startHour, endHour, slotStepMinutes);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(weekStart, { weekStartsOn: 1 }), i));

  const handleDragStart = (e: React.DragEvent, activity: Activity) => {
    setDraggedActivity(activity);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedActivity(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ date, time });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault();
    if (draggedActivity) {
      onActivityDrop(draggedActivity, date, time);
    }
    setDraggedActivity(null);
    setDropTarget(null);
  };

  const getActivitiesForSlot = (date: Date, time: string) => {
    return activities.filter((activity) => {
      const activityDate = format(activity.date, "yyyy-MM-dd");
      const slotDate = format(date, "yyyy-MM-dd");
      
      if (activityDate !== slotDate) return false;
      if (activity.allDay) return false;
      
      // Check if activity starts at this time slot
      return activity.startTime === time;
    });
  };

  const calculateActivityHeight = (activity: Activity) => {
    const rowHeight = 48; // Height of one 30-min slot in pixels
    const slotsPerHour = 60 / slotStepMinutes;
    const durationInSlots = (activity.duration / slotStepMinutes);
    return durationInSlots * rowHeight;
  };

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if current time is within the grid range
    if (currentHour < startHour || currentHour > endHour) {
      return null;
    }
    
    const rowHeight = 48; // Height of one 30-min slot in pixels
    const slotsPerHour = 60 / slotStepMinutes;
    
    // Calculate position within the current hour
    const minutesInCurrentHour = currentMinute;
    const positionInHour = minutesInCurrentHour / 60;
    const positionInSlots = positionInHour * slotsPerHour;
    
    // Calculate total position from grid start
    const hoursFromStart = currentHour - startHour;
    const totalPositionInSlots = (hoursFromStart * slotsPerHour) + positionInSlots;
    
    return totalPositionInSlots * rowHeight;
  };

  const isCurrentTimeVisible = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour <= endHour;
  };

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/30">
        {/* Empty corner for time column */}
        <div className="p-2 border-r border-border" />
        
        {weekDays.map((day) => {
          const isToday = isSameDay(day, currentTime);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center border-r border-border last:border-r-0 transition-colors",
                isToday && "bg-primary/10 border-primary/30"
              )}
            >
              <div className={cn(
                "text-sm font-semibold",
                isToday && "text-primary"
              )}>
                {format(day, "EEE", { locale: pl })}
              </div>
              <div className={cn(
                "text-xs",
                isToday ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {format(day, "d MMM", { locale: pl })}
              </div>
              {isToday && (
                <div className="text-xs text-primary font-bold mt-1">
                  DZIŚ
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="overflow-auto max-h-[calc(100vh-300px)]">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r border-border">
            {timeSlots.map((slot) => (
              <div
                key={slot.label}
                className="h-12 p-2 text-xs text-muted-foreground border-b border-border last:border-b-0 flex items-center justify-end"
              >
                {slot.label}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const isToday = isSameDay(day, currentTime);
            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "border-r border-border last:border-r-0 relative",
                  isToday && "bg-primary/5"
                )}
              >
              {timeSlots.map((slot) => {
                const slotActivities = getActivitiesForSlot(day, slot.label);
                const isDropTarget = 
                  dropTarget?.date.toISOString() === day.toISOString() && 
                  dropTarget?.time === slot.label;

                return (
                  <div
                    key={slot.label}
                    className={cn(
                      "h-12 border-b border-border last:border-b-0 relative hover:bg-muted/20 transition-colors cursor-pointer",
                      isDropTarget && "bg-primary/10 ring-2 ring-primary/30"
                    )}
                    onClick={() => onSlotClick(day, slot.label)}
                    onDragOver={(e) => handleDragOver(e, day, slot.label)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, slot.label)}
                  >
                    {slotActivities.map((activity) => {
                      const collisions = detectCollisions(activity, activities);
                      const hasCollision = collisions.length > 0;
                      const height = calculateActivityHeight(activity);

                      return (
                        <div
                          key={activity.id}
                          className="absolute inset-x-1 z-10"
                          style={{ height: `${height}px` }}
                        >
                          <ActivityCard
                            activity={activity}
                            onClick={() => onActivityClick(activity)}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedActivity?.id === activity.id}
                            hasCollision={hasCollision}
                            className="h-full"
                            currentTime={currentTime}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* Current time line for today's column */}
              {isToday && isCurrentTimeVisible() && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{
                    top: `${getCurrentTimePosition()}px`,
                  }}
                >
                  <div className="flex items-center">
                    {/* Time line */}
                    <div className="h-0.5 bg-primary w-full relative">
                      <div className="absolute -left-1 -top-1 w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                    {/* Time label */}
                    <div className="ml-2 px-2 py-1 bg-primary text-white text-xs font-medium rounded-md shadow-sm">
                      {format(currentTime, "HH:mm")}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

