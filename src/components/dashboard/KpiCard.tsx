"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  status?: 'green' | 'yellow' | 'red' | 'blue';
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}

const statusColors = {
  green: {
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
    badge: 'bg-success/20 text-success',
  },
  yellow: {
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
    badge: 'bg-warning/20 text-warning',
  },
  red: {
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    text: 'text-danger',
    badge: 'bg-danger/20 text-danger',
  },
  blue: {
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
    badge: 'bg-info/20 text-info',
  },
};

const trendIcons = {
  up: '↗',
  down: '↘',
  stable: '→',
};

export function KpiCard({
  label,
  value,
  sublabel,
  status = 'green',
  trend,
  icon,
}: KpiCardProps) {
  const colors = statusColors[status];

  return (
    <Card className={cn(
      'h-full transition-all duration-200 hover:shadow-md',
      colors.bg,
      colors.border
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-sm font-medium', colors.text)}>
            {label}
          </CardTitle>
          {icon && (
            <div className={cn('p-2 rounded-lg', colors.bg)}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Główna wartość */}
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-bold', colors.text)}>
              {value}
            </span>
            {trend && (
              <span className="text-lg opacity-70">
                {trendIcons[trend]}
              </span>
            )}
          </div>
          
          {/* Podpis */}
          {sublabel && (
            <p className={cn('text-sm opacity-80', colors.text)}>
              {sublabel}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Komponenty pomocnicze dla konkretnych KPI
export function ACWRCard({ acwr, status, label }: {
  acwr: number;
  status: 'green' | 'yellow' | 'red' | 'blue';
  label: string;
}) {
  return (
    <KpiCard
      label="ACWR"
      value={acwr.toFixed(2)}
      sublabel={label}
      status={status}
      icon={
        <div className="w-3 h-3 rounded-full bg-current opacity-60" />
      }
    />
  );
}

export function SRPECard({ sum7, label }: {
  sum7: number;
  label: string;
}) {
  return (
    <KpiCard
      label="sRPE (7 dni)"
      value={sum7.toFixed(0)}
      sublabel={label}
      status="green"
      icon={
        <div className="w-3 h-3 rounded-full bg-current opacity-60" />
      }
    />
  );
}

export function ChronicCard({ chronic, label }: {
  chronic: number;
  label: string;
}) {
  return (
    <KpiCard
      label="Średnia sRPE (28 dni)"
      value={chronic.toFixed(1)}
      sublabel={label}
      status="green"
      icon={
        <div className="w-3 h-3 rounded-full bg-current opacity-60" />
      }
    />
  );
}

export function ReadinessCard({ readiness, status, label }: {
  readiness: number;
  status: 'green' | 'yellow' | 'red';
  label: string;
}) {
  return (
    <KpiCard
      label="Gotowość"
      value={readiness.toFixed(1)}
      sublabel={label}
      status={status}
      icon={
        <div className="w-3 h-3 rounded-full bg-current opacity-60" />
      }
    />
  );
}
