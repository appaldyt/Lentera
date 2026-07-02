"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plane, ChevronRight, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Left Column - Branding */}
      <div className="relative flex w-full flex-col justify-center overflow-hidden bg-navy lg:w-1/2 p-8 lg:p-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/aviation_bg.png"
            alt="Corporate Aviation Background"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky text-surface shadow-lg">
              <Plane className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-wider text-surface">
              LENTERA
            </h1>
          </div>

          <div className="mt-16 space-y-6 lg:mt-0">
            <h2 className="text-4xl font-semibold text-surface lg:text-5xl leading-tight">
              Learning, Evaluation, Needs, Training & Employee Reporting Application
            </h2>
            <p className="text-lg text-sky-light max-w-xl leading-relaxed">
              Platform terpusat untuk memonitor, mengelola, dan mengoptimalkan
              seluruh kegiatan training serta sertifikasi karyawan perusahaan
              secara efisien dan terstruktur.
            </p>

            <div className="flex items-center gap-4 pt-8">
              <div className="flex flex-col gap-1 border-l-2 border-sky pl-4">
                <span className="text-2xl font-bold text-surface">Real-time</span>
                <span className="text-sm text-sky-light">Monitoring</span>
              </div>
              <div className="flex flex-col gap-1 border-l-2 border-sky pl-4">
                <span className="text-2xl font-bold text-surface">Centralized</span>
                <span className="text-sm text-sky-light">Database</span>
              </div>
              <div className="flex flex-col gap-1 border-l-2 border-sky pl-4">
                <span className="text-2xl font-bold text-surface">Automated</span>
                <span className="text-sm text-sky-light">Alerts</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-sm text-sky-light/60">
            &copy; 2025 PT Integrasi Aviasi Solusi. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 p-8 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.1)] z-10 bg-surface">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy">Selamat Datang</h2>
            <p className="mt-2 text-text-secondary">
              Silakan login untuk mengakses dashboard LENTERA
            </p>
          </div>

          <Card className="border-border/60 shadow-lg shadow-navy/5">
            <CardHeader>
              <CardTitle className="text-xl">Login Portal</CardTitle>
              <CardDescription>
                Gunakan kredensial email korporat Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@ias.id"
                    required
                    className="h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-sm font-medium text-sky hover:text-sky-light transition-colors"
                    >
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="h-11 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-text-secondary/50 hover:text-text-secondary transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base group"
                  disabled={loading}
                >
                  {loading ? (
                    "Memverifikasi..."
                  ) : (
                    <>
                      Masuk ke Dashboard
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
