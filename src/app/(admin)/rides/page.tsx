'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  status: string;
  requested_at: string;
  passenger_name: string;
  driver_name: string | null;
}

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch('/api/rides');
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
      }
    } catch (err) {
      console.error('Error:', err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Todos los Viajes</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-4">
          {['', 'completed', 'cancelled', 'requested'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === status ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === '' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay viajes</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ruta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pasajero</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rides.filter(r => !filter || r.status === filter).map((ride) => (
                  <tr key={ride.id}>
                    <td className="px-4 py-3 text-sm font-mono">
                      {ride.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="truncate max-w-[150px]">{ride.pickup_address}</p>
                        <p className="text-gray-500 truncate max-w-[150px]">{ride.dropoff_address}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{ride.passenger_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(ride.status)}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${ride.fare?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
