"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "EVALUATION_ADMIN" | "EVALUATOR";

export interface CurrentUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  USER: "User",
  EVALUATION_ADMIN: "Evaluation Admin",
  EVALUATOR: "Evaluator",
};

const DEMO_USER: CurrentUser = {
  name: "Super Admin",
  email: "superadmin@ias.id",
  role: "SUPER_ADMIN",
};

interface UserContextValue {
  user: CurrentUser;
  setUser: (user: CurrentUser) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(DEMO_USER);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user as CurrentUser);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
