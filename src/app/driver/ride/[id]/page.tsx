'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RideProgressBar } from '@/components/RideProgressBar';
import { FeedbackTags, DRIVER_TAGS } from '@/components/FeedbackTags';

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
  passenger_id: string;
  requested_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  passenger_name: string;
  passenger_phone: string | null;
  distance_km: number | null;
  estimated_time: number | null;
}

function formatDuration(from: string | null, to: string | null): string {
  if (!from || !to) return '—';
  const diff = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
  return diff < 60 ? `${diff} min` : `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

export default function DriverRidePage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Post-completion state
  const [showEarnings, setShowEarnings] = useState(false);
  const [showPassengerRating, setShowPassengerRating] = useState(false);
  const [passengerRating, setPassengerRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [passengerComment, setPassengerComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);

  const fetchRide = useCallback(async () => {
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
  }, [id, router]);

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, [fetchRide]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/rides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await fetchRide();
        if (action === 'complete') {
          setShowEarnings(true);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitPassengerRating = async () => {
    if (!ride) return;
    setRatingLoading(true);
    try {
      await fetch('/api/rides/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: ride.id,
          ratedId: ride.passenger_id,
          score: passengerRating,
          comment: passengerComment,
          tags: selectedTags,
        }),
      });
      setRatingDone(true);
      setShowPassengerRating(false);
      setTimeout(() => router.push('/driver/dashboard'), 1500);
    } catch (err) {
      console.error('Rating error:', err);
    } finally {
      setRatingLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const getRatingLabel = (score: number) => {
    const labels = ['', 'Mal pasajero', 'Regular', 'Pasable', 'Buen pasajero', 'Excelente'];
    return labels[score] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Viaje no encontrado</p>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Viaje #{String(ride.id).slice(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-gray-300 capitalize">{ride.status}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Progress */}
        <RideProgressBar status={ride.status as 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled'} />

        {/* Passenger + fare */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                {ride.passenger_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{ride.passenger_name}</p>
                {ride.passenger_phone && (
                  <a href={`tel:${ride.passenger_phone}`} className="text-sm text-blue-600 hover:underline">
                    {ride.passenger_phone}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">${ride.fare?.toFixed(2)}</p>
              {ride.distance_km && (
                <p className="text-sm text-gray-400">{ride.distance_km} km</p>
              )}
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Recogida</p>
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

          {/* Timestamps */}
          {ride.accepted_at && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
              {ride.accepted_at && <span>Aceptado: {formatDuration(null, null)}</span>}
              {ride.started_at && <span>Iniciado: {new Date(ride.started_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>}
              {ride.completed_at && (
                <span className="col-span-2">
                  Duración: {formatDuration(ride.started_at, ride.completed_at)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action button */}
        {ride.status === 'accepted' && (
          <button
            onClick={() => handleAction('start')}
            disabled={actionLoading}
            className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl disabled:bg-gray-300 hover:bg-blue-700 transition"
          >
            {actionLoading ? 'Iniciando...' : '▶ Iniciar viaje — Pasajero a bordo'}
          </button>
        )}

        {ride.status === 'started' && (
          <button
            onClick={() => handleAction('complete')}
            disabled={actionLoading}
            className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl disabled:bg-gray-300 hover:bg-green-700 transition"
          >
            {actionLoading ? 'Completando...' : '✅ Finalizar viaje — Llegamos al destino'}
          </button>
        )}

        {ratingDone && (
          <div className="bg-green-100 text-green-800 p-5 rounded-xl text-center">
            <p className="text-3xl mb-2">⭐</p>
            <p className="font-semibold text-lg">¡Gracias por calificar!</p>
            <p className="text-sm text-green-600 mt-1">Volviendo al panel...</p>
          </div>
        )}
      </main>

      {/* Earnings popup after completion */}
      {showEarnings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold mb-1">¡Viaje completado!</h2>
            <p className="text-gray-500 mb-4">Ganaste en este viaje</p>
            <div className="bg-green-50 rounded-2xl p-6 mb-4">
              <p className="text-5xl font-bold text-green-600">${ride.fare?.toFixed(2)}</p>
              <div className="flex justify-center gap-6 mt-3 text-sm text-gray-500">
                {ride.distance_km && <span>📍 {ride.distance_km} km</span>}
                {ride.estimated_time && <span>⏱ {ride.estimated_time} min</span>}
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { setShowEarnings(false); setShowPassengerRating(true); }}
                className="w-full py-3 bg-black text-white font-semibold rounded-xl"
              >
                Calificar al pasajero
              </button>
              <button
                onClick={() => { setShowEarnings(false); router.push('/driver/dashboard'); }}
                className="w-full py-3 border border-gray-300 rounded-xl text-gray-600 font-medium"
              >
                Ir al panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate passenger modal */}
      {showPassengerRating && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-center mb-1">¿Cómo fue el pasajero?</h2>
            <p className="text-center text-gray-500 mb-5">{ride.passenger_name}</p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setPassengerRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-5xl transition-transform hover:scale-110"
                >
                  <span className={star <= (hoveredStar || passengerRating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 font-medium mb-5">{getRatingLabel(hoveredStar || passengerRating)}</p>

            {/* Quick tags */}
            <p className="text-sm font-semibold text-gray-700 mb-2">¿Qué destacarías?</p>
            <FeedbackTags tags={DRIVER_TAGS} selected={selectedTags} onToggle={toggleTag} />

            <textarea
              value={passengerComment}
              onChange={(e) => setPassengerComment(e.target.value)}
              placeholder="Comentario adicional (opcional)"
              maxLength={200}
              className="w-full mt-4 p-3 border border-gray-200 rounded-xl resize-none text-sm focus:ring-2 focus:ring-black focus:outline-none"
              rows={2}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowPassengerRating(false); router.push('/driver/dashboard'); }}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600"
              >
                Omitir
              </button>
              <button
                onClick={submitPassengerRating}
                disabled={ratingLoading}
                className="flex-1 py-3 bg-black text-white rounded-xl font-semibold disabled:bg-gray-400"
              >
                {ratingLoading ? 'Enviando...' : 'Calificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
