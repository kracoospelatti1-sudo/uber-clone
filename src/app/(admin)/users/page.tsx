'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_suspended: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const url = filter ? `/api/admin/users?role=${filter}` : '/api/admin/users';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (userId: string, suspended: boolean) => {
    try {
      await fetch('/api/admin/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, suspended: !suspended }),
      });
      fetchUsers();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      driver: 'bg-blue-100 text-blue-800',
      passenger: 'bg-gray-100 text-gray-800',
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 -ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">Gestionar Usuarios</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-4">
          {['', 'driver', 'passenger'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === role ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {role === '' ? 'Todos' : role === 'driver' ? 'Conductores' : 'Pasajeros'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className={user.is_suspended ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_suspended ? (
                        <span className="text-red-600 text-sm font-medium">Suspendido</span>
                      ) : (
                        <span className="text-green-600 text-sm font-medium">Activo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleSuspend(user.id, user.is_suspended)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.is_suspended
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.is_suspended ? 'Activar' : 'Suspender'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
