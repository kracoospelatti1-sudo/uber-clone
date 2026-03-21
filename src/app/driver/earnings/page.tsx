'use client';

import { useEffect, useState } from 'react';

interface Earnings {
  today: number;
  week: number;
  month: number;
  total: number;
  rides_today: number;
  rides_week: number;
  rides_month: number;
}

interface Stats {
  total_rides: number;
  total_earnings: number;
  rating: number;
}

export default function DriverEarningsPage() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ridesRes] = await Promise.all([
        fetch('/api/driver/stats'),
        fetch('/api/driver/rides')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setEarnings(statsData.stats);
      }

      if (ridesRes.ok) {
        const ridesData = await ridesRes.json();
        const rides = ridesData.rides || [];
        setStats({
          total_rides: rides.length,
          total_earnings: rides.reduce((sum: number, r: any) => sum + (r.fare || 0), 0),
          rating: 5.0,
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Ganancias</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <p className="text-gray-500 text-sm">Hoy</p>
          <p className="text-4xl font-bold text-green-600">${earnings?.today?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-gray-500 mt-1">{earnings?.rides_today || 0} viajes</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Esta semana</p>
            <p className="text-2xl font-bold">${earnings?.week?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500">{earnings?.rides_week || 0} viajes</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Este mes</p>
            <p className="text-2xl font-bold">${earnings?.month?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500">{earnings?.rides_month || 0} viajes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Resumen</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total acumulado</span>
              <span className="font-bold">${earnings?.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total de viajes</span>
              <span className="font-bold">{stats?.total_rides || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Calificacion promedio</span>
              <span className="font-bold flex items-center gap-1">
                ⭐ {stats?.rating?.toFixed(1) || '5.0'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
