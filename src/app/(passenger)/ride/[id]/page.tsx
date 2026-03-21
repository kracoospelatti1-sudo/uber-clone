'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare: number;
  status: string;
  driver_id: string | null;
  driver_name: string | null;
  license_plate: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
}

export default function PassengerRidePage() {
  const { id } = useParams();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchRide = async () => {
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
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitRating = async () => {
    try {
      await fetch('/api/rides/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: id,
          ratedId: ride?.driver_id,
          score: rating,
          comment,
        }),
      });
      setRatingSubmitted(true);
      setShowRating(false);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  const handleCancel = () => {
    router.push('/home');
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Viaje</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(ride.status)}`}>
              {ride.status}
            </span>
            <span className="text-2xl font-bold">${ride.fare?.toFixed(2)}</span>
          </div>

          <div className="space-y-4 mb-6">
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

          {ride.driver_name && (
            <div className="p-4 bg-gray-50 rounded-xl mb-4">
              <p className="text-sm text-gray-500 mb-1">Tu conductor</p>
              <p className="font-semibold">{ride.driver_name}</p>
              {ride.license_plate && (
                <p className="text-sm text-gray-600">
                  {ride.vehicle_model} - {ride.license_plate}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {ride.status === 'requested' && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={actionLoading}
              className="w-full py-3 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading ? 'Cancelando...' : 'Cancelar Viaje'}
            </button>
          )}

          {(ride.status === 'accepted' || ride.status === 'started') && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-blue-800 font-medium">
                {ride.status === 'accepted' ? 'El conductor esta en camino' : 'Viaje en progreso'}
              </p>
            </div>
          )}

          {ride.status === 'completed' && !ratingSubmitted && (
            <button
              onClick={() => setShowRating(true)}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg"
            >
              Calificar Viaje
            </button>
          )}

          {ride.status === 'completed' && ratingSubmitted && (
            <div className="bg-green-100 text-green-800 p-4 rounded-xl text-center">
              <p className="font-medium">Gracias por tu calificacion!</p>
            </div>
          )}

          <button
            onClick={handleCancel}
            className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg"
          >
            Volver al inicio
          </button>
        </div>
      </main>

      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-center mb-4">Califica tu viaje</h2>
            
            {ride.driver_name && (
              <p className="text-center text-gray-600 mb-4">Con: {ride.driver_name}</p>
            )}

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional (max 200 caracteres)"
              maxLength={200}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowRating(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              >
                Omitir
              </button>
              <button
                onClick={submitRating}
                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
