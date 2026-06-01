"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
};

const DEMO_USERS: Record<UserRole, CurrentUser> = {
  SUPER_ADMIN: { name: "Super Admin", email: "superadmin@ias.id", role: "SUPER_ADMIN" },
  ADMIN: { name: "Admin HR LENTERA", email: "admin@ias.id", role: "ADMIN" },
  USER: { name: "Budi Santoso", email: "budi.s@ias.id", role: "USER" },
};

interface UserContextValue {
  user: CurrentUser;
  switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(DEMO_USERS.SUPER_ADMIN);
  const switchRole = (role: UserRole) => setUser(DEMO_USERS[role]);
  return (
    <UserContext.Provider value={{ user, switchRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
