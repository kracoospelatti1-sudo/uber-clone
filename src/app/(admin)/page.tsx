'use client';

/**
 * Dashboard del administrador
 * Ultima actualizacion: 2026-03-21
 * Mobile-first responsive design
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface Stats {
  total_users: number;
  total_drivers: number;
  total_passengers: number;
  total_rides_today: number;
  total_rides_week: number;
  total_rides_month: number;
  pending_reports: number;
  pending_verifications: number;
  total_earnings_today: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">Panel de Administracion</h1>
          <p className="text-sm text-gray-300">Gestiona usuarios, conductores y reportes</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Usuarios</p>
            <p className="text-3xl font-bold">{stats?.total_users || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Conductores</p>
            <p className="text-3xl font-bold">{stats?.total_drivers || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Pasajeros</p>
            <p className="text-3xl font-bold">{stats?.total_passengers || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Viajes Hoy</p>
            <p className="text-3xl font-bold">{stats?.total_rides_today || 0}</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push('/admin/reports')}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-left hover:bg-red-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <p className="font-semibold text-red-800">Reportes Pendientes</p>
                <p className="text-red-600">{stats?.pending_reports || 0} reportes sin revisar</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/drivers')}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left hover:bg-yellow-100 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚗</span>
              <div>
                <p className="font-semibold text-yellow-800">Verificaciones Pendientes</p>
                <p className="text-yellow-600">{stats?.pending_verifications || 0} conductores por verificar</p>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Actions */}
        <h2 className="font-semibold text-lg mb-4">Acciones Rapidas</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-white rounded-xl shadow p-4 flex items-center gap-3 hover:shadow-md transition"
          >
            <span className="text-2xl">👥</span>
            <span className="font-medium">Gestionar Usuarios</span>
          </button>
          <button
            onClick={() => router.push('/admin/drivers')}
            className="bg-white rounded-xl shadow p-4 flex items-center gap-3 hover:shadow-md transition"
          >
            <span className="text-2xl">🚗</span>
            <span className="font-medium">Verificar Conductores</span>
          </button>
          <button
            onClick={() => router.push('/admin/reports')}
            className="bg-white rounded-xl shadow p-4 flex items-center gap-3 hover:shadow-md transition"
          >
            <span className="text-2xl">📋</span>
            <span className="font-medium">Revisar Reportes</span>
          </button>
          <button
            onClick={() => router.push('/admin/rides')}
            className="bg-white rounded-xl shadow p-4 flex items-center gap-3 hover:shadow-md transition"
          >
            <span className="text-2xl">🗺️</span>
            <span className="font-medium">Todos los Viajes</span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-around py-2">
          <button 
            onClick={() => router.push('/admin')}
            className="flex flex-col items-center p-2 text-black"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button 
            onClick={() => router.push('/admin/users')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span className="text-xs mt-1">Usuarios</span>
          </button>
          <button 
            onClick={() => router.push('/admin/drivers')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            <span className="text-xs mt-1">Conductores</span>
          </button>
          <button 
            onClick={() => router.push('/admin/reports')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span className="text-xs mt-1">Reportes</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
