'use client';

/**
 * Dashboard del conductor
 * Ultima actualizacion: 2026-03-21
 * Mobile-first responsive design con bottom navigation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface Stats {
  total_rides: number;
  total_rating: number;
  rating_count: number;
  total_earnings: number;
  today_earnings: number;
  week_earnings: number;
}

interface PendingRequest {
  id: string;
  passenger_name: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  distance_km: number;
  estimated_time: number;
}

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; avatar: string | null } | null>(null);
  const router = useRouter();

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener perfil del usuario
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        // Obtener stats
        const statsRes = await fetch('/api/driver/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        // Obtener solicitudes pendientes
        const requestsRes = await fetch('/api/driver/requests');
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setPendingRequests(requestsData.rides || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle disponibilidad
  const toggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      const res = await fetch('/api/drivers/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (res.ok) {
        setIsOnline(newStatus);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Aceptar viaje
  const acceptRide = async (rideId: string) => {
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (res.ok) {
        setPendingRequests(prev => prev.filter(r => r.id !== rideId));
        router.push(`/driver/ride/${rideId}`);
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  };

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
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'Driver'} imageUrl={user?.avatar} size="md" />
            <div>
              <h1 className="font-bold">Conductor</h1>
              {stats && (
                <p className="text-sm text-gray-300">⭐ {stats.total_rating.toFixed(1)} ({stats.rating_count} viajes)</p>
              )}
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            className="text-sm text-gray-300 hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Toggle disponibilidad */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">
                {isOnline ? 'Disponible' : 'No disponible'}
              </h2>
              <p className="text-sm text-gray-500">
                {isOnline ? 'Recibiendo solicitudes' : 'No recibiras solicitudes'}
              </p>
            </div>
            <button
              onClick={toggleOnline}
              className={`
                w-16 h-8 rounded-full transition relative
                ${isOnline ? 'bg-green-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full transition
                  ${isOnline ? 'left-9' : 'left-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Hoy</p>
              <p className="text-2xl font-bold text-green-600">${stats.today_earnings.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Esta semana</p>
              <p className="text-2xl font-bold text-green-600">${stats.week_earnings.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Total ganado</p>
              <p className="text-2xl font-bold">${stats.total_earnings.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Viajes</p>
              <p className="text-2xl font-bold">{stats.total_rides}</p>
            </div>
          </div>
        )}

        {/* Solicitudes pendientes */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-4">Solicitudes</h2>
          
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              <span className="text-4xl">🚗</span>
              <p className="mt-2">No hay solicitudes pendientes</p>
              {isOnline && (
                <p className="text-sm mt-1">Espera a que un pasajero solicite un viaje</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={request.passenger_name} size="md" />
                    <div className="flex-1">
                      <p className="font-semibold">{request.passenger_name}</p>
                      <p className="text-sm text-gray-500">{request.distance_km} km</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">${request.fare}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">●</span>
                      <span className="truncate">{request.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-500">●</span>
                      <span className="truncate">{request.dropoff_address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => acceptRide(request.id)}
                    className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                  >
                    Aceptar viaje
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <button 
            onClick={() => router.push('/driver/dashboard')}
            className="flex flex-col items-center p-2 text-black"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button 
            onClick={() => router.push('/driver/requests')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            <span className="text-xs mt-1">Solicitudes</span>
          </button>
          <button 
            onClick={() => router.push('/driver/history')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs mt-1">Historial</span>
          </button>
          <button 
            onClick={() => router.push('/driver/earnings')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs mt-1">Ganancias</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
