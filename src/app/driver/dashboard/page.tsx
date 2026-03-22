'use client';

/**
 * Dashboard del conductor
 * Mobile-first responsive design con bottom navigation
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface Stats {
  total_rides: number;
  avg_rating: number;
  rating_count: number;
  total_earnings: number;
  today_earnings: number;
  week_earnings: number;
  month_earnings: number;
  rides_today: number;
  rides_week: number;
  acceptance_rate: number;
  cancellation_count: number;
}

interface RecentRating {
  score: number;
  comment: string | null;
  tags: string | null;
  rater_name: string;
  created_at: string;
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

function StarRow({ score }: { score: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= score ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 60) return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
  return `Hace ${Math.floor(diff / 1440)}d`;
}

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRatings, setRecentRatings] = useState<RecentRating[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; avatar: string | null; full_name?: string } | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'ratings'>('requests');
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [userRes, statsRes, requestsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/driver/stats'),
        fetch('/api/driver/requests'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setRecentRatings(statsData.recent_ratings || []);
      }
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setPendingRequests(requestsData.rides || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleOnline = async () => {
    setTogglingStatus(true);
    try {
      const newStatus = !isOnline;
      const res = await fetch('/api/drivers/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      if (res.ok) setIsOnline(newStatus);
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setTogglingStatus(false);
    }
  };

  const acceptRide = async (rideId: string) => {
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      if (res.ok) {
        router.push(`/driver/ride/${rideId}`);
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  const ratingAvg = stats?.avg_rating ?? 5.0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.full_name || user?.name || 'D'} imageUrl={user?.avatar} size="md" />
            <div>
              <h1 className="font-bold text-lg">{user?.full_name || user?.name || 'Conductor'}</h1>
              {stats && (
                <p className="text-sm text-gray-300">
                  ⭐ {ratingAvg.toFixed(1)} · {stats.total_rides} viajes
                </p>
              )}
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Online toggle */}
        <div className={`rounded-2xl shadow-lg p-5 transition-colors ${isOnline ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-bold text-xl ${isOnline ? 'text-green-700' : 'text-gray-800'}`}>
                {isOnline ? '🟢 Disponible' : '⚫ No disponible'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isOnline ? 'Recibiendo solicitudes de viaje' : 'Los pasajeros no te pueden ver'}
              </p>
            </div>
            <button
              onClick={toggleOnline}
              disabled={togglingStatus}
              className={`relative w-16 h-8 rounded-full transition-colors disabled:opacity-60 ${
                isOnline ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  isOnline ? 'left-9' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats grid */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Hoy</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${Number(stats.today_earnings).toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stats.rides_today} viaje{stats.rides_today !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Esta semana</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${Number(stats.week_earnings).toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stats.rides_week} viaje{stats.rides_week !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Calificación</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-2xl font-bold">{ratingAvg.toFixed(1)}</p>
                <span className="text-yellow-400">★</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{stats.rating_count} reseñas</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Aceptación</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className={`text-2xl font-bold ${stats.acceptance_rate >= 80 ? 'text-green-600' : stats.acceptance_rate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stats.acceptance_rate}%
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">últimos 7 días</p>
            </div>
          </div>
        )}

        {/* Tabs: Requests / Ratings */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === 'requests' ? 'text-black border-b-2 border-black' : 'text-gray-400'
              }`}
            >
              Solicitudes {pendingRequests.length > 0 && (
                <span className="ml-1 bg-black text-white text-xs rounded-full px-1.5 py-0.5">{pendingRequests.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === 'ratings' ? 'text-black border-b-2 border-black' : 'text-gray-400'
              }`}
            >
              Mis calificaciones
            </button>
          </div>

          {activeTab === 'requests' && (
            <div className="p-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-4xl mb-2">🚗</p>
                  <p className="font-medium">No hay solicitudes</p>
                  {isOnline ? (
                    <p className="text-sm mt-1">Esperando pasajeros...</p>
                  ) : (
                    <p className="text-sm mt-1">Actívate para recibir viajes</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar name={req.passenger_name} size="md" />
                        <div className="flex-1">
                          <p className="font-semibold">{req.passenger_name}</p>
                          <p className="text-sm text-gray-500">{req.distance_km} km · {req.estimated_time} min</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">${req.fare}</p>
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                        <div className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">●</span>
                          <span className="truncate">{req.pickup_address}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">●</span>
                          <span className="truncate">{req.dropoff_address}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => acceptRide(req.id)}
                        className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition"
                      >
                        Aceptar viaje →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="p-4">
              {recentRatings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-4xl mb-2">⭐</p>
                  <p className="font-medium">Aún sin calificaciones</p>
                  <p className="text-sm mt-1">Completa viajes para recibir reseñas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRatings.map((rating, i) => {
                    const tags = rating.tags ? JSON.parse(rating.tags) as string[] : [];
                    return (
                      <div key={i} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{rating.rater_name}</p>
                            <p className="text-xs text-gray-400">{formatTimeAgo(rating.created_at)}</p>
                          </div>
                          <StarRow score={rating.score} />
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tags.map((tag: string) => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {rating.comment && (
                          <p className="text-sm text-gray-600 italic">&quot;{rating.comment}&quot;</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <button onClick={() => router.push('/driver/dashboard')} className="flex flex-col items-center p-2 text-black">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button onClick={() => router.push('/driver/requests')} className="flex flex-col items-center p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-xs mt-1">Solicitudes</span>
          </button>
          <button onClick={() => router.push('/driver/earnings')} className="flex flex-col items-center p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Ganancias</span>
          </button>
          <button onClick={() => router.push('/driver/verification')} className="flex flex-col items-center p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
