'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  passenger_phone?: string;
}

export default function DriverRequestsPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const router = useRouter();

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/driver/requests');
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const acceptRide = async (rideId: string) => {
    setAccepting(rideId);
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
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Solicitudes de Viajes</h1>
          <p className="text-sm text-gray-300 mt-1">Nuevos viajes disponibles</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl">🚗</span>
            <p className="mt-4 text-gray-500">No hay viajes disponibles</p>
            <p className="text-sm text-gray-400">Se actualiza automaticamente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{ride.passenger_name}</p>
                    <p className="text-sm text-gray-500">{ride.passenger_phone}</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">${Number(ride.fare).toFixed(2)}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">●</span>
                    <span className="text-sm">{ride.pickup_address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">●</span>
                    <span className="text-sm">{ride.dropoff_address}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>{ride.distance_km ? Number(ride.distance_km).toFixed(1) : '—'} km</span>
                  <span>{new Date(ride.requested_at).toLocaleTimeString()}</span>
                </div>

                <button
                  onClick={() => acceptRide(ride.id)}
                  disabled={accepting === ride.id}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  {accepting === ride.id ? 'Aceptando...' : 'Aceptar Viaje'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
