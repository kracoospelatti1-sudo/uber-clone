'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RideProgressBar } from '@/components/RideProgressBar';
import { FeedbackTags, PASSENGER_TAGS } from '@/components/FeedbackTags';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  status: string;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  driver_rating?: number;
  license_plate: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  distance_km: number | null;
  estimated_time: number | null;
  accepted_at: string | null;
  started_at: string | null;
}

const CANCEL_REASONS = [
  'El conductor tardó mucho',
  'Me equivoqué de dirección',
  'Cambié de planes',
  'Encontré otro transporte',
  'Otro',
];

export default function PassengerRidePage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Rating flow
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Cancel flow
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // ETA
  const [eta, setEta] = useState<number | null>(null);
  const [driverArriving, setDriverArriving] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      const res = await fetch(`/api/rides/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRide(data.ride);
        if (data.ride.status === 'completed' && !ratingSubmitted) {
          setShowRating(true);
        }
      }
    } catch (err) {
      console.error('Error fetching ride:', err);
    } finally {
      setLoading(false);
    }
  }, [id, ratingSubmitted]);

  const fetchEta = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/rides/${id}/eta`);
      if (res.ok) {
        const data = await res.json();
        setEta(data.eta_minutes);
        setDriverArriving(data.eta_minutes !== null && data.eta_minutes <= 2);
      }
    } catch {
      // ETA optional, ignore errors
    }
  }, [id]);

  useEffect(() => {
    fetchRide();
    const interval = setInterval(() => {
      fetchRide();
      fetchEta();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchRide, fetchEta]);

  const handleCancel = async () => {
    if (!cancelReason) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/rides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', cancelReason }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        fetchRide();
      }
    } catch (err) {
      console.error('Error cancelling ride:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const submitRating = async () => {
    if (!ride?.driver_id) return;
    setRatingLoading(true);
    try {
      const res = await fetch('/api/rides/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: id,
          ratedId: ride.driver_id,
          score: rating,
          comment,
          tags: selectedTags,
        }),
      });
      if (res.ok) {
        setRatingSubmitted(true);
        setShowRating(false);
        router.push(`/ride/${id}/summary`);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
    } finally {
      setRatingLoading(false);
    }
  };

  const getRatingLabel = (score: number) => {
    const labels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
    return labels[score] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-3" />
          <p className="text-gray-500">Cargando viaje...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Viaje no encontrado</p>
          <button onClick={() => router.push('/home')} className="px-4 py-2 bg-black text-white rounded-lg">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">Tu viaje</h1>
            <p className="text-xs text-gray-400">#{String(id).slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </header>

      {/* Driver arriving banner */}
      {driverArriving && ride.status === 'accepted' && (
        <div className="bg-green-500 text-white px-4 py-3 text-center animate-pulse">
          <p className="font-bold">🚗 ¡Tu conductor está llegando!</p>
          <p className="text-sm">Está a menos de 2 minutos</p>
        </div>
      )}

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Progress bar */}
        <RideProgressBar status={ride.status as 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled'} />

        {/* Status + fare */}
        <div className="bg-white rounded-xl shadow-lg p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Estado del viaje</p>
              <StatusMessage status={ride.status} eta={eta} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarifa</p>
              <p className="text-2xl font-bold">${Number(ride.fare).toFixed(2)}</p>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Recogida</p>
                <p className="font-medium text-sm">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="ml-1.5 w-px h-4 bg-gray-300" />
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Destino</p>
                <p className="font-medium text-sm">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Trip details */}
          {(ride.distance_km || ride.estimated_time) && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
              {ride.distance_km && (
                <div className="text-center">
                  <p className="text-lg font-bold">{ride.distance_km} km</p>
                  <p className="text-xs text-gray-400">Distancia</p>
                </div>
              )}
              {ride.estimated_time && (
                <div className="text-center">
                  <p className="text-lg font-bold">{ride.estimated_time} min</p>
                  <p className="text-xs text-gray-400">Duración est.</p>
                </div>
              )}
              {eta !== null && ride.status === 'accepted' && (
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{eta} min</p>
                  <p className="text-xs text-gray-400">ETA conductor</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Driver card */}
        {ride.driver_name && ride.status !== 'requested' && (
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Tu conductor</p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                {ride.driver_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{ride.driver_name}</p>
                {ride.driver_rating !== undefined && (
                  <p className="text-sm text-yellow-500">⭐ {Number(ride.driver_rating).toFixed(1)}</p>
                )}
                {ride.vehicle_model && (
                  <p className="text-sm text-gray-500">
                    {ride.vehicle_color} {ride.vehicle_model}
                  </p>
                )}
                {ride.license_plate && (
                  <p className="text-sm font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                    {ride.license_plate}
                  </p>
                )}
              </div>
              {ride.driver_phone && (
                <a
                  href={`tel:${ride.driver_phone}`}
                  className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 hover:bg-green-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Status-based actions */}
        {ride.status === 'requested' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-3 border-2 border-red-400 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition"
          >
            Cancelar viaje
          </button>
        )}

        {ride.status === 'accepted' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-blue-800 font-semibold">El conductor está en camino 🚗</p>
            {eta !== null && (
              <p className="text-blue-600 text-sm mt-1">Llega en aprox. {eta} min</p>
            )}
          </div>
        )}

        {ride.status === 'started' && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <p className="text-purple-800 font-semibold">🛣️ Viaje en progreso</p>
            <p className="text-purple-600 text-sm mt-1">Disfruta el viaje</p>
          </div>
        )}

        {ride.status === 'completed' && ratingSubmitted && (
          <div className="bg-green-100 text-green-800 p-5 rounded-xl text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-semibold text-lg">¡Gracias por tu calificación!</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-3 px-6 py-2 bg-black text-white rounded-lg text-sm font-medium"
            >
              Nuevo viaje
            </button>
          </div>
        )}

        {ride.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-700 font-semibold">Viaje cancelado</p>
            <button onClick={() => router.push('/home')} className="mt-3 px-6 py-2 bg-black text-white rounded-lg text-sm">
              Pedir otro viaje
            </button>
          </div>
        )}
      </main>

      {/* Rating modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-0">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-center mb-1">¿Cómo estuvo tu viaje?</h2>
            {ride.driver_name && (
              <p className="text-center text-gray-500 mb-5">Con {ride.driver_name}</p>
            )}

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="text-5xl transition-transform hover:scale-110"
                >
                  <span className={star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                </button>
              ))}
            </div>
            <p className="text-center text-gray-500 font-medium mb-5">{getRatingLabel(hoveredStar || rating)}</p>

            {/* Quick tags */}
            <p className="text-sm font-semibold text-gray-700 mb-2">¿Qué destacarías?</p>
            <FeedbackTags tags={PASSENGER_TAGS} selected={selectedTags} onToggle={toggleTag} />

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario adicional (opcional)"
              maxLength={200}
              className="w-full mt-4 p-3 border border-gray-200 rounded-xl resize-none text-sm focus:ring-2 focus:ring-black focus:outline-none"
              rows={2}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRating(false); router.push(`/ride/${id}/summary`); }}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-600"
              >
                Omitir
              </button>
              <button
                onClick={submitRating}
                disabled={ratingLoading}
                className="flex-1 py-3 bg-black text-white rounded-xl font-semibold disabled:bg-gray-400"
              >
                {ratingLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel reason modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h2 className="text-xl font-bold mb-1">¿Por qué cancelás?</h2>
            <p className="text-gray-500 text-sm mb-4">Tu feedback nos ayuda a mejorar</p>

            <div className="space-y-2 mb-5">
              {CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    cancelReason === reason
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason || actionLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold disabled:bg-gray-300"
              >
                {actionLoading ? 'Cancelando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusMessage({ status, eta }: { status: string; eta: number | null }) {
  switch (status) {
    case 'requested':
      return (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <p className="font-semibold text-yellow-700">Buscando conductor...</p>
        </div>
      );
    case 'accepted':
      return (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="font-semibold text-blue-700">
            {eta !== null ? `Conductor en camino · ${eta} min` : 'Conductor en camino'}
          </p>
        </div>
      );
    case 'started':
      return (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <p className="font-semibold text-purple-700">En viaje</p>
        </div>
      );
    case 'completed':
      return <p className="font-semibold text-green-700 mt-1">✅ Completado</p>;
    case 'cancelled':
      return <p className="font-semibold text-red-700 mt-1">❌ Cancelado</p>;
    default:
      return <p className="font-semibold mt-1 capitalize">{status}</p>;
  }
}
