"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Settings, User, Menu, Wifi, WifiOff, LayoutDashboard, Calendar, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

interface HeaderProps {
  user?: UserProfile;
  notificationsCount?: number;
  isOffline?: boolean;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

export function Header({
  user,
  notificationsCount = 0,
  isOffline = false,
  onLogout,
  onProfileClick,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock user data - w prawdziwej aplikacji będzie z props lub context
  const mockUser: UserProfile = user || {
    name: "Jakub Glebocki",
    email: "jakub@example.com",
    initials: "JG",
  };

  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      // Domyślne zachowanie - otwórz modal profilu
      console.log("Otwieranie modal profilu zawodnika");
    }
  };

  const handleSettingsClick = () => {
    console.log("Otwieranie menu ustawień");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Domyślne zachowanie - przekieruj do logowania
      router.push("/login");
    }
  };

  // Motyw jest stały (dark). Brak wyboru motywu przez użytkownika.

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/plan", label: "Plan", icon: Calendar },
    { href: "/units", label: "Jednostki", icon: ListChecks },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Sekcja lewa - Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1"
              aria-label="Przejdź do strony głównej"
            >
              {/* Logo PadelNote - SVG */}
              <Image
                src="/logo.svg"
                alt="PadelNote"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </button>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "text-[var(--color-logo)]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    style={active ? { backgroundColor: "rgba(var(--color-highlight-bg-rgb) / 0.12)" } : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Offline indicator */}
            {isOffline && (
              <Badge variant="secondary" className="bg-warning/15 text-warning border-warning/20">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>

          {/* Sekcja prawa - Profil i ustawienia */}
          <div className="flex items-center gap-3">
            {/* Desktop - Avatar (bez przełączników motywu) */}
            <div className="hidden md:flex items-center gap-3">
              {/* Avatar */}
              <button
                onClick={handleProfileClick}
                className="relative flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Otwórz profil zawodnika"
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full border-2 border-border bg-gradient-to-br from-primary to-logo flex items-center justify-center text-white font-semibold text-sm">
                    {mockUser.avatar ? (
                      <img
                        src={mockUser.avatar}
                        alt={`Avatar ${mockUser.name}`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      mockUser.initials
                    )}
                  </div>
                  
                  {/* Notification badge */}
                  {notificationsCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-danger rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {notificationsCount > 9 ? "9+" : notificationsCount}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {/* Minimal menu ustawień – tylko wylogowanie */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-muted"
                    aria-label="Menu aplikacji"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleLogout} className="text-danger">
                    <Wifi className="h-4 w-4 mr-2" />
                    Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile - Hamburger menu */}
            <div className="md:hidden">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    aria-label="Otwórz menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Navigation Items */}
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem 
                        key={item.href}
                        onClick={() => {
                          router.push(item.href);
                          setIsMenuOpen(false);
                        }}
                        className={isActive(item.href) ? "text-[var(--color-logo)]" : ""}
                        style={isActive(item.href) ? { backgroundColor: "rgba(var(--color-highlight-bg-rgb) / 0.12)" } : undefined}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="h-4 w-4 mr-2" />
                    Profil zawodnika
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="h-4 w-4 mr-2" />
                    Ustawienia
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-danger">
                    <Wifi className="h-4 w-4 mr-2" />
                    Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
