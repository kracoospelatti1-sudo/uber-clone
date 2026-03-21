'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  fare: number;
  status: string;
  requested_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  passenger_name: string;
  passenger_phone: string | null;
}

export default function DriverRidePage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchRide = async () => {
    try {
      const res = await fetch(`/api/rides/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRide(data.ride);
      } else {
        router.push('/driver/dashboard');
      }
    } catch (err) {
      console.error('Error fetching ride:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/rides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchRide();
        if (action === 'complete') {
          setTimeout(() => {
            router.push('/driver/history');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Viaje no encontrado</p>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (ride.status) {
      case 'accepted': return 1;
      case 'started': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/driver/dashboard" className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Viaje #{ride.id.slice(0, 8)}</h1>
            <p className="text-sm text-gray-300 capitalize">{ride.status}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold text-lg">{ride.passenger_name}</p>
              <p className="text-gray-500">{ride.passenger_phone || 'Sin telefono'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">${ride.fare?.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></span>
              <div>
                <p className="text-sm text-gray-500">Recoger</p>
                <p className="font-medium">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></span>
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-medium">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex justify-between">
            {['Solicitado', 'Aceptado', 'En curso', 'Completado'].map((step, i) => (
              <div key={step} className="text-center flex-1">
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  getStatusStep() >= i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <p className="text-xs text-gray-500">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {ride.status === 'accepted' && (
          <button
            onClick={() => handleAction('start')}
            disabled={actionLoading}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-400"
          >
            {actionLoading ? 'Iniciando...' : 'Iniciar Viaje'}
          </button>
        )}

        {ride.status === 'started' && (
          <button
            onClick={() => handleAction('complete')}
            disabled={actionLoading}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg disabled:bg-gray-400 animate-pulse"
          >
            {actionLoading ? 'Completando...' : 'Finalizar Viaje - Llegue al destino'}
          </button>
        )}

        {ride.status === 'completed' && (
          <div className="bg-green-100 text-green-800 p-6 rounded-xl text-center animate-bounce">
            <p className="font-semibold text-lg">Viaje completado!</p>
            <p className="text-sm mt-1">Ganaste ${ride.fare?.toFixed(2)}</p>
            <p className="text-xs mt-2 text-green-600">Redirigiendo al historial...</p>
          </div>
        )}
      </main>
    </div>
  );
}
