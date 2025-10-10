// app/styleguide/page.tsx
// Next.js (App Router) styleguide page using new Padel Note color palette
// Colors: primary, logo, accent-yellow, accent-teal, accent-blue, sky, bgDark, textLight, border

'use client'

import React from 'react'

type Token = {
  name: string
  var: string
  hex: string
}

// Nowoczesna paleta kolorów Padel Note 2.0 - Dark Sport Theme
const TOKENS: Token[] = [
  { name: 'primary', var: 'bg-primary', hex: '#FF6B35' },
  { name: 'logo', var: 'bg-logo', hex: '#FFB800' },
  { name: 'accent-cyan', var: 'bg-[var(--color-accent-cyan)]', hex: '#00D9B4' },
  { name: 'accent-blue', var: 'bg-[var(--color-accent-blue)]', hex: '#0EA5E9' },
  { name: 'accent-purple', var: 'bg-[var(--color-accent-purple)]', hex: '#A855F7' },
  { name: 'sky', var: 'bg-[var(--color-sky)]', hex: '#38BDF8' },
  { name: 'bg-dark', var: 'bg-[var(--color-bg-dark)]', hex: '#0A0E13' },
  { name: 'bg-elevated', var: 'bg-[var(--color-bg-elevated)]', hex: '#151A21' },
  { name: 'border', var: 'bg-[var(--color-border)]', hex: '#1F2937' },
  { name: 'success', var: 'bg-success', hex: '#00D9B4' },
  { name: 'warning', var: 'bg-warning', hex: '#FBBF24' },
  { name: 'danger', var: 'bg-danger', hex: '#EF4444' },
  { name: 'info', var: 'bg-info', hex: '#0EA5E9' },
]

function Swatch({ name, hex, className }: { name: string; hex: string; className: string }) {
  const onDark = name === 'bgDark'
  return (
    <div className="rounded-xl shadow-sm overflow-hidden border border-black/5">
      <div className={`${className} h-16 w-full`} />
      <div className={`p-3 text-sm ${onDark ? 'bg-bgDark text-textLight' : 'bg-white text-gray-800'}`}>
        <div className="font-medium">{name}</div>
        <div className="opacity-70 font-mono">{hex}</div>
      </div>
    </div>
  )
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div>{children}</div>
    </section>
  )
}

export default function StyleguidePage() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  return (
    <main className="min-h-[100svh] w-full bg-white text-gray-900 dark:bg-[var(--color-bg-dark)] dark:text-[var(--color-text-light)]">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-logo to-[var(--color-accent-cyan)] bg-clip-text text-transparent">
              Padel Note 2.0
            </h1>
            <p className="opacity-75">Nowoczesny, energetyczny design system</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark((v) => !v)}
              className="px-3 py-2 rounded-md border border-[var(--color-border)] bg-white dark:bg-[var(--color-bg-elevated)] hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-logo text-[#0A0E13] font-semibold shadow-lg shadow-logo/20">
              ⚡ Premium
            </span>
          </div>
        </header>

        {/* Colors */}
        <Section title="Color tokens">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {TOKENS.map((t) => (
              <Swatch key={t.name} name={t.name} hex={t.hex} className={t.var} />
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary rounded-lg px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary font-semibold">
              🔥 Start Training
            </button>
            <button className="btn-gradient rounded-lg px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary font-semibold">
              ⚡ Power Mode
            </button>
            <button className="btn-logo rounded-lg px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-logo">
              ✨ Go Premium
            </button>
            <button className="border-2 border-[var(--color-border-light)] text-foreground rounded-lg px-5 py-2.5 hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-accent-blue)] transition-all font-medium">
              Secondary
            </button>
            <button className="px-4 py-2 text-[var(--color-accent-blue)] hover:text-[var(--color-accent-cyan)] hover:underline transition font-medium">
              Link Button
            </button>
            <button disabled className="bg-muted text-muted-foreground rounded-lg px-5 py-2.5 cursor-not-allowed opacity-50">
              Disabled
            </button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges & States">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/15 text-success px-3 py-1.5 text-sm font-semibold border border-success/20 shadow-sm shadow-success/10">
              <span className="size-2 rounded-full bg-success animate-pulse" /> ✓ Progress
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-warning/15 text-warning px-3 py-1.5 text-sm font-semibold border border-warning/20">
              <span className="size-2 rounded-full bg-warning" /> ⚠ Warning
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-danger/15 text-danger px-3 py-1.5 text-sm font-semibold border border-danger/20">
              <span className="size-2 rounded-full bg-danger" /> ✕ Danger
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-info/15 text-info px-3 py-1.5 text-sm font-semibold border border-info/20">
              <span className="size-2 rounded-full bg-info" /> ⓘ Info
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--color-highlight-bg-rgb))]/15 text-logo px-3 py-1.5 text-sm font-bold border border-logo/30 shadow-md shadow-logo/20">
              <span className="size-2 rounded-full bg-logo" /> 🏆 Achievement
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple)] px-3 py-1.5 text-sm font-bold border border-[var(--color-accent-purple)]/30">
              <span className="size-2 rounded-full bg-[var(--color-accent-purple)]" /> ✨ PRO
            </span>
          </div>
        </Section>

        {/* Form */}
        <Section title="Form controls">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Email</span>
              <input
                type="email"
                className="rounded-md border border-[var(--color-border)] bg-white dark:bg-white/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                placeholder="you@example.com"
              />
              <span className="text-xs text-[var(--color-border)] dark:text-white/60">We will never share your email.</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm opacity-80">Password</span>
              <input
                type="password"
                className="rounded-md border border-[var(--color-border)] bg-white dark:bg-white/5 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]"
                placeholder="••••••••"
              />
              <span className="text-xs text-danger">Must be at least 8 characters.</span>
            </label>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 bg-card border-2 border-[var(--color-border)] hover:border-primary/50 transition-all shadow-lg hover:shadow-xl hover:shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Training Plan</h3>
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">Your weekly progress tracker</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold text-success">75%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="progress-glow h-full w-3/4"></div>
                </div>
              </div>
              <button className="btn-primary rounded-lg px-4 py-2 w-full text-sm font-semibold">
                Continue Training
              </button>
            </div>
            
            <div className="rounded-xl p-6 bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-dark)] border-2 border-[var(--color-accent-cyan)]/20 shadow-lg shadow-[var(--color-accent-cyan)]/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Achievement</h3>
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">7-day streak completed!</p>
              <div className="flex gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 text-success px-3 py-1 text-xs font-bold border border-success/30">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  Active
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-logo/15 text-logo px-3 py-1 text-xs font-bold border border-logo/30">
                  +100 XP
                </span>
              </div>
              <button className="btn-logo rounded-lg px-4 py-2 w-full text-sm">
                Claim Reward
              </button>
            </div>
            
            <div className="rounded-xl p-6 bg-gradient-to-br from-primary/10 via-transparent to-[var(--color-accent-purple)]/10 border-2 border-primary/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Go PRO</h3>
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">Unlock premium analytics</p>
              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>Advanced metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span>AI-powered insights</span>
                </li>
              </ul>
              <button className="btn-gradient rounded-lg px-4 py-2 w-full text-sm font-semibold">
                Upgrade Now
              </button>
            </div>
          </div>
        </Section>

        {/* Table */}
        <Section title="Table">
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] dark:border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Metric</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--color-border)]/30 dark:border-white/10">
                  <td className="px-4 py-3">ACWR</td>
                  <td className="px-4 py-3">1.23</td>
                  <td className="px-4 py-3 text-success font-medium">+0.08</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]/30 dark:border-white/10">
                  <td className="px-4 py-3">sRPE (7d)</td>
                  <td className="px-4 py-3">312 AU</td>
                  <td className="px-4 py-3 text-warning font-medium">+12</td>
                </tr>
                <tr className="border-t border-[var(--color-border)]/30 dark:border-white/10">
                  <td className="px-4 py-3">Readiness</td>
                  <td className="px-4 py-3">7/10</td>
                  <td className="px-4 py-3 text-danger font-medium">-1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Chart placeholder */}
        <Section title="Chart Colors - Energetic & Clear">
          <div className="grid grid-cols-5 gap-3 items-end h-48 p-6 rounded-xl bg-card border-2 border-[var(--color-border)]">
            <div className="bg-primary h-32 rounded-lg shadow-lg shadow-primary/30 hover:h-36 transition-all" title="Chart 1: Primary Orange" />
            <div className="bg-[var(--color-accent-blue)] h-40 rounded-lg shadow-lg shadow-[var(--color-accent-blue)]/30 hover:h-44 transition-all" title="Chart 2: Electric Blue" />
            <div className="bg-success h-20 rounded-lg shadow-lg shadow-success/30 hover:h-24 transition-all" title="Chart 3: Neon Cyan" />
            <div className="bg-[var(--color-accent-purple)] h-36 rounded-lg shadow-lg shadow-[var(--color-accent-purple)]/30 hover:h-40 transition-all" title="Chart 4: Purple" />
            <div className="bg-warning h-24 rounded-lg shadow-lg shadow-warning/30 hover:h-28 transition-all" title="Chart 5: Amber" />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Energetyczne kolory zoptymalizowane dla ciemnego tła • Wysoki kontrast • Wyraźna czytelność
          </p>
        </Section>

        <footer className="pt-8 border-t border-[var(--color-border)] text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-semibold text-foreground mb-2">Padel Note 2.0 - Modern Dark Sport Theme</p>
              <p>Zdefiniowano w <code className="bg-muted px-2 py-0.5 rounded text-xs">globals.css</code></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                Primary #FF6B35
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-semibold">
                Success #00D9B4
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-logo/10 text-logo border border-logo/20 text-xs font-semibold">
                Logo #FFB800
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}