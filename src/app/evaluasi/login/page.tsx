"use client";

import { useState } from "react";
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
import { Lock, ChevronRight, AlertCircle, Plane, Eye, EyeOff } from "lucide-react";
import { loginEvaluator } from "@/actions/auth";

export default function EvaluasiLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await loginEvaluator(formData);

    if (!result.success) {
      setError(result.error || "Gagal masuk. Periksa kembali kredensial Anda.");
      setLoading(false);
      return;
    }

    // Redirect to dashboard
    window.location.href = "/evaluasi/dashboard";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3 mb-2">
          {/* Logo LENTERA */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky text-surface shadow-lg">
              <Plane className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold tracking-wider text-navy">
              LENTERA
            </h1>
          </div>
          
          <h2 className="text-xl font-semibold text-sky tracking-wide uppercase">Evaluasi Training</h2>
          
          <div className="pt-4">
            <h3 className="text-3xl font-bold text-navy">Selamat Datang</h3>
            <p className="mt-2 text-text-secondary">
              Silakan login untuk mengakses dashboard LENTERA
            </p>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg shadow-navy/5 bg-surface">
          <CardHeader>
            <CardTitle className="text-xl text-navy">Login Evaluasi Training</CardTitle>
            <CardDescription className="text-text-secondary">
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
                <Label htmlFor="email" className="text-navy font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@ias.id"
                  required
                  className="h-11 border-border focus-visible:ring-sky"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-navy font-medium">Password</Label>
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
                    className="h-11 pr-10 border-border focus-visible:ring-sky"
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
                className="w-full h-11 text-base group bg-navy hover:bg-navy-dark text-surface"
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
  );
}
