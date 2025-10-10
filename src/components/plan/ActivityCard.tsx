"use client";

import React from "react";
import { Activity, getActivityTypeConfig, getStatusLabel, getStatusColor, getAutoStatus } from "@/lib/activity-types";
import { cn } from "@/lib/utils";
import { GripVertical, Clock, CheckCircle2, XCircle, Play, CheckCircle } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, activity: Activity) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  hasCollision?: boolean;
  className?: string;
  currentTime?: Date;
}

export function ActivityCard({
  activity,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
  hasCollision = false,
  className,
  currentTime = new Date(),
}: ActivityCardProps) {
  const config = getActivityTypeConfig(activity.type);
  const Icon = config.icon;
  
  // Get the actual status (auto-updated based on time)
  const actualStatus = getAutoStatus(activity, currentTime);
  
  const isCancelled = actualStatus === "cancelled";
  const isPendingApproval = actualStatus === "pending_approval";
  const isConfirmed = actualStatus === "confirmed";
  const isInProgress = actualStatus === "in_progress";
  const isCompleted = actualStatus === "completed";

  // Status icon
  const StatusIcon = isPendingApproval ? Clock : 
                     isConfirmed ? CheckCircle2 : 
                     isInProgress ? Play : 
                     isCompleted ? CheckCircle : 
                     isCancelled ? XCircle : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      draggable={!isCancelled}
      onDragStart={(e) => !isCancelled && onDragStart?.(e, activity)}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={cn(
        "group relative rounded-md border-l-4 p-2 transition-all",
        !isCancelled && "cursor-move hover:shadow-lg hover:scale-[1.02]",
        isCancelled && "opacity-60 cursor-pointer",
        isDragging && "opacity-50 cursor-grabbing",
        hasCollision && !isCancelled && "ring-2 ring-warning/50",
        className
      )}
      style={{
        backgroundColor: config.bgColor,
        borderLeftColor: isCancelled ? "#9CA3AF" : config.color,
        borderRightColor: config.borderColor,
        borderTopColor: config.borderColor,
        borderBottomColor: config.borderColor,
      }}
    >
      {/* Drag handle */}
      {!isCancelled && (
        <div className="absolute left-1 top-1 opacity-0 group-hover:opacity-50 transition-opacity">
          <GripVertical className="h-4 w-4" style={{ color: config.color }} />
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-2 pl-4">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: isCancelled ? "#9CA3AF" : config.color }} />
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-sm font-semibold truncate",
            isCancelled && "line-through"
          )} style={{ color: isCancelled ? "#9CA3AF" : config.color }}>
            {activity.title || config.label}
          </div>
          
          <div className="text-xs text-muted-foreground">
            {activity.allDay ? (
              <span>Cały dzień</span>
            ) : (
              <span>{activity.startTime} - {activity.endTime}</span>
            )}
          </div>
          
          {/* Status badge */}
          {(isPendingApproval || isConfirmed || isInProgress || isCompleted || isCancelled) && (
            <div className="flex items-center gap-1 mt-1">
              {StatusIcon && (
                <StatusIcon 
                  className="h-3 w-3" 
                  style={{ color: getStatusColor(actualStatus) }} 
                />
              )}
              <span 
                className="text-xs font-medium"
                style={{ color: getStatusColor(actualStatus) }}
              >
                {getStatusLabel(actualStatus)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collision indicator */}
      {hasCollision && !isCancelled && (
        <div className="absolute top-1 right-1">
          <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
        </div>
      )}
    </div>
  );
}

