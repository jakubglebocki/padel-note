"use client";

import { useState } from "react";
import { Header } from "./Header";
import { ProfileModal } from "./ProfileModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [isOffline, setIsOffline] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileModalOpen(false);
  };

  const handleProfileSave = (profile: any) => {
    console.log("Profile saved:", profile);
    // Tutaj będzie logika zapisywania profilu
  };

  const handleLogout = () => {
    console.log("Logout");
    // Tutaj będzie logika wylogowania
  };

  const handleThemeChange = (theme: "system" | "light" | "dark") => {
    console.log("Theme changed to:", theme);
    // Tutaj będzie logika zmiany motywu
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        notificationsCount={notificationsCount}
        isOffline={isOffline}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        {children}
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleProfileClose}
        onSave={handleProfileSave}
      />
    </div>
  );
}
