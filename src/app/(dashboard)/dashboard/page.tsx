"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, AlertTriangle, CreditCard } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const budgetData = [
  { name: "Jan", planned: 4000, actual: 2400 },
  { name: "Feb", planned: 3000, actual: 1398 },
  { name: "Mar", planned: 2000, actual: 9800 },
  { name: "Apr", planned: 2780, actual: 3908 },
  { name: "May", planned: 1890, actual: 4800 },
  { name: "Jun", planned: 2390, actual: 3800 },
  { name: "Jul", planned: 3490, actual: 4300 },
];

const trainingData = [
  { name: "Safety", value: 40 },
  { name: "Leadership", value: 30 },
  { name: "Technical", value: 20 },
  { name: "Compliance", value: 27 },
  { name: "Soft Skills", value: 18 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-navy">Dashboard</h2>
        <p className="text-text-secondary">Ringkasan aktivitas training dan lisensi hari ini.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Training Berjalan
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-sky" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">12</div>
            <p className="text-xs text-text-secondary">
              +2 dibanding bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Lisensi Hampir Expired
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">5</div>
            <p className="text-xs text-warning">
              Butuh perpanjangan dalam 30 hari
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Realisasi Anggaran
            </CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">Rp 45.2M</div>
            <p className="text-xs text-text-secondary">
              64% dari total budget tahunan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Peserta Terdaftar
            </CardTitle>
            <Users className="h-4 w-4 text-sky-light" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">248</div>
            <p className="text-xs text-text-secondary">
              Karyawan aktif bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Anggaran vs Realisasi (YTD)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#5A6B7C" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#5A6B7C" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `Rp${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F5F7FA' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="planned" fill="#1E88E5" radius={[4, 4, 0, 0]} name="Planned" />
                  <Bar dataKey="actual" fill="#0B2A4A" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribusi Kategori Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E6ED" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#5A6B7C" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#5A6B7C" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E0E6ED' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1E88E5" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#1E88E5', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#0B2A4A', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
