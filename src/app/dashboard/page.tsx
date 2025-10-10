"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WeekHeader } from "@/components/dashboard/WeekHeader";
import { ACWRCard, SRPECard, ChronicCard, ReadinessCard } from "@/components/dashboard/KpiCard";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { Recommendations } from "@/components/dashboard/Recommendations";
import { calculateSRPEMetrics } from "@/lib/metrics/srpe";
import { calculateACWR } from "@/lib/metrics/acwr";
import { calculatePlanRealization } from "@/lib/metrics/percent";
import { generateRecommendations } from "@/lib/metrics/reco";

// Typy danych wejściowych
export interface DashboardInputs {
  weekStart: string;    // YYYY-MM-DD (lokalne)
  weekEnd: string;      // YYYY-MM-DD (lokalne)
  today: string;        // YYYY-MM-DD (lokalne)
  activities: Array<{
    id: string;
    date: string;               // YYYY-MM-DD (lokalne)
    type: 'training'|'match'|'sparing'|'americano'|'tournament'|'gym';
    durationMin: number;
    sRPE?: number;              // 0–10; AU = sRPE * durationMin
    status: 'planned'|'done'|'canceled';
  }>;
  readiness: Array<{ date: string; value: number }>; // 0–10
  historyAU: Array<{ date: string; au: number }>;    // ≥ 28 dni; dzienne AU
  acwrMethod: 'avg4w'|'ewma28';
  timezone: string;  // np. "Europe/Warsaw"
  locale: string;    // np. "pl-PL"
}

// Mock dane dla testów
const mockData: DashboardInputs = {
  weekStart: "2024-01-15",
  weekEnd: "2024-01-21",
  today: "2024-01-18",
  activities: [
    {
      id: "1",
      date: "2024-01-15",
      type: "training",
      durationMin: 90,
      sRPE: 7,
      status: "done"
    },
    {
      id: "2",
      date: "2024-01-16",
      type: "match",
      durationMin: 120,
      sRPE: 8,
      status: "done"
    },
    {
      id: "3",
      date: "2024-01-17",
      type: "training",
      durationMin: 60,
      sRPE: 6,
      status: "done"
    },
    {
      id: "4",
      date: "2024-01-18",
      type: "match",
      durationMin: 100,
      sRPE: 9,
      status: "done"
    },
    {
      id: "5",
      date: "2024-01-19",
      type: "training",
      durationMin: 75,
      sRPE: 5,
      status: "planned"
    },
    {
      id: "6",
      date: "2024-01-20",
      type: "match",
      durationMin: 110,
      sRPE: 8,
      status: "planned"
    }
  ],
  readiness: [
    { date: "2024-01-16", value: 7.5 },
    { date: "2024-01-17", value: 6.8 },
    { date: "2024-01-18", value: 8.2 }
  ],
  historyAU: [
    { date: "2024-01-01", au: 450 },
    { date: "2024-01-02", au: 320 },
    { date: "2024-01-03", au: 280 },
    { date: "2024-01-04", au: 380 },
    { date: "2024-01-05", au: 420 },
    { date: "2024-01-06", au: 350 },
    { date: "2024-01-07", au: 300 },
    { date: "2024-01-08", au: 480 },
    { date: "2024-01-09", au: 520 },
    { date: "2024-01-10", au: 400 },
    { date: "2024-01-11", au: 360 },
    { date: "2024-01-12", au: 440 },
    { date: "2024-01-13", au: 380 },
    { date: "2024-01-14", au: 320 },
    { date: "2024-01-15", au: 630 },
    { date: "2024-01-16", au: 960 },
    { date: "2024-01-17", au: 360 },
    { date: "2024-01-18", au: 900 }
  ],
  acwrMethod: "avg4w",
  timezone: "Europe/Warsaw",
  locale: "pl-PL"
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardInputs>(mockData);
  const [isLoading] = useState(false);

  // Oblicz metryki
  const metrics = useMemo(() => {
    const srpeMetrics = calculateSRPEMetrics(
      data.activities,
      data.historyAU,
      data.today,
      data.acwrMethod
    );

    const acwrMetrics = calculateACWR(srpeMetrics.sum7, srpeMetrics.chronic28);

    const planRealization = calculatePlanRealization(
      data.activities,
      data.weekStart,
      data.weekEnd
    );

    // Średnia gotowość z ostatnich 3 dni
    const recentReadiness = data.readiness
      .slice(-3)
      .reduce((sum, item) => sum + item.value, 0) / Math.min(data.readiness.length, 3);

    const readinessStatus = recentReadiness >= 7 ? 'green' : 
                           recentReadiness >= 4 ? 'yellow' : 'red';

    const readinessLabel = recentReadiness >= 7 ? 'Wysoka gotowość' :
                          recentReadiness >= 4 ? 'Średnia gotowość' : 'Niska gotowość';

    // Generuj rekomendacje
    const recommendations = generateRecommendations({
      acwr: acwrMetrics.acwr,
      chronic: srpeMetrics.chronic28,
      sum7: srpeMetrics.sum7,
      readiness: recentReadiness,
      planPercent: planRealization.percent,
      hasData: data.historyAU.length > 0,
    });

    return {
      srpe: srpeMetrics,
      acwr: acwrMetrics,
      plan: planRealization,
      readiness: {
        value: recentReadiness,
        status: readinessStatus,
        label: readinessLabel
      },
      recommendations
    };
  }, [data]);

  // Handlery dla sterowania tygodniami
  const handlePrevWeek = () => {
    const currentStart = new Date(data.weekStart);
    const newStart = new Date(currentStart);
    newStart.setDate(currentStart.getDate() - 7);
    
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);

    setData(prev => ({
      ...prev,
      weekStart: newStart.toISOString().split('T')[0],
      weekEnd: newEnd.toISOString().split('T')[0]
    }));
  };

  const handleNextWeek = () => {
    const currentStart = new Date(data.weekStart);
    const newStart = new Date(currentStart);
    newStart.setDate(currentStart.getDate() + 7);
    
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);

    setData(prev => ({
      ...prev,
      weekStart: newStart.toISOString().split('T')[0],
      weekEnd: newEnd.toISOString().split('T')[0]
    }));
  };

  const handleThisWeek = () => {
    const today = new Date(data.today);
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setData(prev => ({
      ...prev,
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0]
    }));
  };

  const handleGoToPlan = () => {
    router.push('/plan');
  };

  // Przygotuj dane dla wykresów
  const srpeChartData = metrics.srpe.dailyAU.map(item => ({
    date: item.date,
    value: item.au
  }));

  const acwrChartData = metrics.srpe.dailyAU.map((item, index) => {
    if (index < 6) return { date: item.date, value: 0 }; // Brak danych dla pierwszych 6 dni
    
    const sevenDaySum = metrics.srpe.dailyAU
      .slice(Math.max(0, index - 6), index + 1)
      .reduce((sum, day) => sum + day.au, 0);
    
    const acwr = sevenDaySum / Math.max(metrics.srpe.chronic28, 1);
    return { date: item.date, value: acwr };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard tygodnia
          </h1>
          <p className="text-muted-foreground">
            Przegląd formy, obciążenia i rekomendacji treningowych
          </p>
        </div>

        {/* Week Header */}
        <div className="mb-8">
          <WeekHeader
            weekStart={data.weekStart}
            weekEnd={data.weekEnd}
            today={data.today}
            percentDone={metrics.plan.percent}
            onPrevWeek={handlePrevWeek}
            onThisWeek={handleThisWeek}
            onNextWeek={handleNextWeek}
            onGoToPlan={handleGoToPlan}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ACWRCard
            acwr={metrics.acwr.acwr}
            status={metrics.acwr.color}
            label={metrics.acwr.label}
          />
          <SRPECard
            sum7={metrics.srpe.sum7}
            label="Ostatnie 7 dni"
          />
          <ChronicCard
            chronic={metrics.srpe.chronic28}
            label="Chronic load"
          />
          <ReadinessCard
            readiness={metrics.readiness.value}
            status={metrics.readiness.status as 'green' | 'yellow' | 'red'}
            label={metrics.readiness.label}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TrendsChart
            type="srpe"
            data={srpeChartData}
            title="sRPE (28 dni)"
            subtitle="Dzienne obciążenie treningowe w jednostkach AU"
          />
          <TrendsChart
            type="acwr"
            data={acwrChartData}
            optimalBand={{ min: 0.8, max: 1.3 }}
            title="ACWR (28 dni)"
            subtitle="Stosunek obciążenia ostrego do chronicznego"
          />
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <Recommendations
            items={metrics.recommendations}
            isLoading={isLoading}
          />
        </div>

        {/* Debug Info (tylko w development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 text-foreground">Debug Info:</h3>
            <pre className="text-xs overflow-auto text-muted-foreground">
              {JSON.stringify({
                planRealization: metrics.plan,
                srpe: metrics.srpe,
                acwr: metrics.acwr,
                readiness: metrics.readiness
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
