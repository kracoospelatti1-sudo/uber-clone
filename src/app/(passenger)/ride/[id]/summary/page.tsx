'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  distance_km: number | null;
  estimated_time: number | null;
  requested_at: string;
  completed_at: string | null;
  driver_name: string | null;
  driver_rating?: number;
  vehicle_model: string | null;
  vehicle_color: string | null;
  license_plate: string | null;
}

function formatDuration(from: string | null, to: string | null): string {
  if (!from || !to) return '—';
  const diff = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
  if (diff < 60) return `${diff} min`;
  return `${Math.floor(diff / 60)}h ${diff % 60}min`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const BASE_FARE = 5;
const DISTANCE_RATE = 2;
const TIME_RATE = 0.5;

export default function RideSummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await fetch(`/api/rides/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRide(data.ride);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Resumen no disponible</p>
      </div>
    );
  }

  const distanceCharge = (ride.distance_km || 0) * DISTANCE_RATE;
  const timeCharge = (ride.estimated_time || 0) * TIME_RATE;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Resumen del viaje</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Big fare card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Total pagado</p>
          <p className="text-5xl font-bold mb-1">${ride.fare?.toFixed(2)}</p>
          {ride.requested_at && (
            <p className="text-sm text-gray-400">{formatDate(ride.requested_at)}</p>
          )}
        </div>

        {/* Trip stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Distancia', value: ride.distance_km ? `${ride.distance_km} km` : '—', icon: '📍' },
            { label: 'Duración', value: formatDuration(ride.requested_at, ride.completed_at), icon: '⏱️' },
            { label: 'Tarifa/km', value: ride.distance_km ? `$${(ride.fare / ride.distance_km).toFixed(1)}` : '—', icon: '💰' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="font-bold text-lg">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Route */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Ruta</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Origen</p>
                <p className="font-medium text-sm">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="ml-1.5 w-px h-4 bg-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Destino</p>
                <p className="font-medium text-sm">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fare breakdown */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Desglose de tarifa</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tarifa base</span>
              <span className="font-medium">${BASE_FARE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distancia ({ride.distance_km || 0} km × ${DISTANCE_RATE})</span>
              <span className="font-medium">${distanceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiempo ({ride.estimated_time || 0} min × ${TIME_RATE})</span>
              <span className="font-medium">${timeCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 font-bold">
              <span>Total</span>
              <span>${ride.fare?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Driver info */}
        {ride.driver_name && (
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Conductor</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                {ride.driver_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{ride.driver_name}</p>
                {ride.driver_rating !== undefined && (
                  <p className="text-sm text-yellow-500">⭐ {Number(ride.driver_rating).toFixed(1)}</p>
                )}
                {ride.vehicle_model && (
                  <p className="text-sm text-gray-500">
                    {ride.vehicle_color} {ride.vehicle_model}
                    {ride.license_plate && ` · ${ride.license_plate}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-8">
          <button
            onClick={() => router.push('/home')}
            className="w-full py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition"
          >
            Nuevo viaje
          </button>
          <button
            onClick={() => router.push('/history')}
            className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Ver historial
          </button>
        </div>
      </main>
    </div>
  );
}
