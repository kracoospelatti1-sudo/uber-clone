'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function RidePage() {
  const { id } = useParams();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`/api/rides/${id}`);
        const data = await res.json();
        if (res.ok) {
          setRide(data.ride);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAction = async (action: string) => {
    try {
      const res = await fetch(`/api/rides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setRide(data.ride);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Viaje no encontrado</p>
      </div>
    );
  }

  const statusMessages: Record<string, string> = {
    requested: 'Buscando conductor...',
    accepted: 'Conductor encontrado',
    started: 'Viaje en progreso',
    completed: 'Viaje completado',
    cancelled: 'Viaje cancelado',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">UBER</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Estado del viaje</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {statusMessages[ride.status] || ride.status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
              <div>
                <p className="text-sm text-gray-500">Recoger</p>
                <p className="font-medium">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
              <div>
                <p className="text-sm text-gray-500">Dejar</p>
                <p className="font-medium">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>

          {ride.driver_name && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Tu conductor</h3>
              <p className="text-gray-600">{ride.driver_name}</p>
              {ride.license_plate && (
                <p className="text-sm text-gray-500">Patente: {ride.license_plate}</p>
              )}
            </div>
          )}

          {ride.fare && (
            <div className="mt-6 flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold">${ride.fare}</span>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {ride.status === 'requested' && (
              <button
                onClick={() => handleAction('cancel')}
                className="w-full py-3 border border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50"
              >
                Cancelar viaje
              </button>
            )}
            
            {ride.status === 'accepted' && ride.driver_name && (
              <button
                onClick={() => handleAction('start')}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
              >
                Iniciar viaje
              </button>
            )}
            
            {ride.status === 'started' && (
              <button
                onClick={() => handleAction('complete')}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
              >
                Completar viaje
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <a href="/home" className="text-black font-medium hover:underline">
            ← Volver al inicio
          </a>
        </div>
      </main>
    </div>
  );
}
