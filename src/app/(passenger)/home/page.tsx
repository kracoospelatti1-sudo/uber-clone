'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const router = useRouter();

  const handleRequestRide = async () => {
    if (!pickup || !dropoff) return;
    
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupAddress: pickup,
          pickupLat: -34.6037,
          pickupLng: -58.3816,
          dropoffAddress: dropoff,
          dropoffLat: -34.6177,
          dropoffLng: -58.3816,
          estimatedTime: 15,
          distanceKm: 5.2,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/ride/${data.ride.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">UBER</h1>
          <button 
            onClick={() => router.push('/profile')}
            className="p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4">¿A dónde vas?</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Recoger en</label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Dirección de recogida"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dejar en</label>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Dirección de destino"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleRequestRide}
            disabled={!pickup || !dropoff}
            className="w-full mt-4 py-3 bg-black text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition"
          >
            Solicitar viaje
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {['UberX', 'Uber Comfort', 'Uber Black', 'UberXL'].map((option) => (
            <div key={option} className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <div className="font-semibold">{option}</div>
              <div className="text-sm text-gray-500">3 min</div>
              <div className="text-sm font-medium mt-1">$250</div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <button 
            onClick={() => router.push('/home')}
            className="flex flex-col items-center p-2 text-black"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button 
            onClick={() => router.push('/history')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs mt-1">Viajes</span>
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
