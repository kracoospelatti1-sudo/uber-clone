'use client';

/**
 * Pagina de verificacion de vehiculo para conductores
 * Ultima actualizacion: 2026-03-21
 * Mobile-first responsive design
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface VehicleDocument {
  verification_status: 'pending' | 'approved' | 'rejected';
  license_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  vehicle_type?: string;
  rejection_reason: string | null;
}

export default function VerificationPage() {
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: '',
    vehicleType: 'economico',
    photoFront: '',
    photoBack: '',
    licensePhoto: '',
  });
  const [status, setStatus] = useState<VehicleDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Verificar estado de verificacion
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/driver/verification/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data.document);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  // Manejar cambio de foto
  const handlePhotoChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/driver/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al enviar');
        return;
      }

      setSuccess('Documentos enviados correctamente');
      setStatus({ 
        license_plate: formData.licensePlate,
        vehicle_brand: formData.vehicleBrand,
        vehicle_model: formData.vehicleModel,
        vehicle_year: formData.vehicleYear,
        vehicle_color: formData.vehicleColor,
        vehicle_type: formData.vehicleType,
        verification_status: 'pending',
        rejection_reason: null
      });
    } catch {
      setError('Error al enviar los documentos');
    } finally {
      setSubmitting(false);
    }
  };

  // Si ya esta aprobado, redirigir
  if (status?.verification_status === 'approved') {
    router.push('/driver/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Verificacion de Vehiculo</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Estado pendiente */}
        {status?.verification_status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <span className="text-5xl">⏳</span>
              <h2 className="text-xl font-semibold mt-4 text-yellow-800">Verificacion en Proceso</h2>
              <p className="text-yellow-700 mt-2">
                Estamos revisando tus documentos. Este proceso puede tomar unos minutos.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
              >
                Verificar estado
              </button>
            </div>
          </div>
        )}

        {/* Estado rechazado */}
        {status?.verification_status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <span className="text-5xl">❌</span>
              <h2 className="text-xl font-semibold mt-4 text-red-800">Solicitud Rechazada</h2>
              {status.rejection_reason && (
                <p className="text-red-700 mt-2 bg-white p-3 rounded-lg">
                  <strong>Razon:</strong> {status.rejection_reason}
                </p>
              )}
              <p className="text-red-600 mt-2">
                Por favor, corrige los datos e intenta nuevamente.
              </p>
            </div>
          </div>
        )}

        {/* Errores */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Exito */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
          <h2 className="text-lg font-semibold">Datos del Vehiculo</h2>

          {/* Patente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
            <input
              type="text"
              value={formData.licensePlate}
              onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base uppercase"
              placeholder="ABC123"
              required
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <input
              type="text"
              value={formData.vehicleBrand}
              onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Toyota"
              required
            />
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
            <input
              type="text"
              value={formData.vehicleModel}
              onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              placeholder="Corolla"
              required
            />
          </div>

          {/* Ano y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
              <input
                type="number"
                value={formData.vehicleYear}
                onChange={(e) => setFormData({ ...formData, vehicleYear: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                min={2000}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
              <input
                type="text"
                value={formData.vehicleColor}
                onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
                placeholder="Gris"
                required
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de vehiculo *</label>
            <div className="grid grid-cols-2 gap-3">
              {['economico', 'comfort', 'black', 'xl'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, vehicleType: type })}
                  className={`py-3 px-4 rounded-lg border-2 text-sm font-medium capitalize transition ${
                    formData.vehicleType === type
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {type === 'economico' ? 'Economico' : 
                   type === 'comfort' ? 'Comfort' : 
                   type === 'black' ? 'Black' : 'XL'}
                </button>
              ))}
            </div>
          </div>

          {/* Fotos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Fotos (opcionales para testing)</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { field: 'photoFront', label: 'Frontal' },
                { field: 'photoBack', label: 'Trasera' },
                { field: 'licensePhoto', label: 'Licencia' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1">{label}</label>
                  <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 overflow-hidden">
                    {formData[field as keyof typeof formData] ? (
                      <img 
                        src={formData[field as keyof typeof formData] as string} 
                        alt={label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">+</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange(field)}
                      className="hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-black text-white font-semibold rounded-lg text-base hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {submitting ? 'Enviando...' : 'Enviar para Verificacion'}
          </button>
        </form>
      </main>
    </div>
  );
}
