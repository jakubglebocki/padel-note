"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Save, Edit, X } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  dominantHand?: "left" | "right";
  about?: string;
  experience?: string;
  achievements?: string[];
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  onSave?: (profile: UserProfile) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
}: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(
    user || {
      name: "Jakub Glebocki",
      email: "jakub@example.com",
      phone: "+48 123 456 789",
      dateOfBirth: "1990-01-01",
      height: 180,
      weight: 75,
      dominantHand: "right",
      about: "Zawodnik padel z 5-letnim doświadczeniem. Specjalizuję się w grze defensywnej i strategicznym planowaniu meczów.",
      experience: "5 lat",
      achievements: ["Mistrz turnieju lokalnego 2023", "2. miejsce w Pucharze Regionu 2022"],
    }
  );

  const handleSave = () => {
    if (onSave) {
      onSave(profile);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfile(user || profile);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil zawodnika
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Dane osobowe</TabsTrigger>
            <TabsTrigger value="physical">Dane fizyczne</TabsTrigger>
            <TabsTrigger value="about">O mnie</TabsTrigger>
            <TabsTrigger value="settings">Ustawienia</TabsTrigger>
          </TabsList>

          {/* Dane osobowe */}
          <TabsContent value="personal" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dane osobowe</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Anuluj
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={profile.phone || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Data urodzenia</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, dateOfBirth: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </TabsContent>

          {/* Dane fizyczne */}
          <TabsContent value="physical" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dane fizyczne</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Anuluj
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Wzrost (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, height: parseInt(e.target.value) })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="weight">Waga (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, weight: parseInt(e.target.value) })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="dominantHand">Dominująca ręka</Label>
                <select
                  id="dominantHand"
                  value={profile.dominantHand || "right"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      dominantHand: e.target.value as "left" | "right",
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="right">Prawa</option>
                  <option value="left">Lewa</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* O mnie */}
          <TabsContent value="about" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">O mnie</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Anuluj
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="about">Opis</Label>
                <textarea
                  id="about"
                  value={profile.about || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, about: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-[100px] resize-none"
                  placeholder="Opowiedz o sobie..."
                />
              </div>
              <div>
                <Label htmlFor="experience">Doświadczenie</Label>
                <Input
                  id="experience"
                  value={profile.experience || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, experience: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="np. 3 lata"
                />
              </div>
              <div>
                <Label>Osiągnięcia</Label>
                <div className="space-y-2">
                  {profile.achievements?.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-logo/10 text-logo">
                        🏆
                      </Badge>
                      <span className="text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ustawienia aplikacji */}
          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ustawienia aplikacji
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Motyw</h4>
                  <p className="text-sm text-muted-foreground">
                    Wybierz motyw aplikacji
                  </p>
                </div>
                <select className="px-3 py-2 border border-input rounded-md bg-background text-foreground">
                  <option value="system">Systemowy</option>
                  <option value="light">Jasny</option>
                  <option value="dark">Ciemny</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Powiadomienia</h4>
                  <p className="text-sm text-muted-foreground">
                    Otrzymuj powiadomienia o aktywnościach
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Autosave</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatyczne zapisywanie zmian
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Wskazówki</h4>
                  <p className="text-sm text-muted-foreground">
                    Wyświetlaj wskazówki i porady
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
