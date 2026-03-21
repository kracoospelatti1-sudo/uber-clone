'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  distance_km: number;
  status: string;
  requested_at: string;
  passenger_name: string;
  driver_name?: string;
}

export default function HistoryPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchRides();
  }, [filter]);

  const fetchRides = async () => {
    try {
      const url = filter ? `/api/rides/history?status=${filter}` : '/api/rides/history';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
      }
    } catch (err) {
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      requested: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      started: 'bg-purple-100 text-purple-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Historial de Viajes</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="flex gap-2 mb-4">
          {['', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === status ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === '' ? 'Todos' : status === 'completed' ? 'Completados' : 'Cancelados'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <span className="text-4xl">🚗</span>
            <p className="mt-2">No hay viajes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Link key={ride.id} href={`/ride/${ride.id}`}>
                <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ride.status)}`}>
                      {ride.status}
                    </span>
                    <span className="font-bold text-lg">${ride.fare?.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">●</span>
                      <span className="truncate">{ride.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600">●</span>
                      <span className="truncate">{ride.dropoff_address}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs text-gray-500">
                    <span>{formatDate(ride.requested_at)}</span>
                    <span>{ride.distance_km?.toFixed(1)} km</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
