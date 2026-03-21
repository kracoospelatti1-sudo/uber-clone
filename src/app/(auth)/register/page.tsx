'use client';

/**
 * Pagina de registro de usuario
 * Ultima actualizacion: 2026-03-21
 * Mobile-first responsive design
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'passenger',
    avatarUrl: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convertir imagen a base64 para guardar en DB
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setFormData(prev => ({ ...prev, avatarUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Redirigir segun rol
      if (formData.role === 'driver') {
        router.push('/driver/verification');
      } else {
        router.push('/home');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Completa tus datos para registrarte</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-gray-300 hover:border-black transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-400">+</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-2">Toca para agregar foto</p>
          </div>

          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="Juan Perez"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="juan@email.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-black focus:outline-none"
              placeholder="+54 11 1234-5678"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cuenta</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'passenger' })}
                className={`py-3 px-4 rounded-lg border-2 text-base font-medium transition ${
                  formData.role === 'passenger'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Pasajero
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'driver' })}
                className={`py-3 px-4 rounded-lg border-2 text-base font-medium transition ${
                  formData.role === 'driver'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                Conductor
              </button>
            </div>
            {formData.role === 'driver' && (
              <p className="text-xs text-gray-500 mt-2">
                Deberas verificar tu vehiculo antes de comenzar
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-semibold rounded-lg text-base hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-gray-600">
          Ya tienes cuenta?{' '}
          <a href="/login" className="text-black font-semibold hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
