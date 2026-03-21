'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFormData({
          fullName: data.user.full_name,
          phone: data.user.phone || '',
          avatarUrl: data.user.avatar_url || '',
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('Perfil actualizado');
        setEditing(false);
        fetchUser();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Error al actualizar');
      }
    } catch {
      setMessage('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mi Perfil</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-gray-300">
              Editar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar name={user?.full_name || ''} imageUrl={formData.avatarUrl} size="lg" />
              {editing && (
                <label className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              <p className="text-gray-500 text-sm capitalize">{user?.role}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="+54..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-black text-white font-semibold rounded-lg disabled:bg-gray-400"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Telefono</label>
                <p className="font-medium">{user?.phone || 'No establecido'}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50"
        >
          Cerrar sesion
        </button>
      </main>
    </div>
  );
}
