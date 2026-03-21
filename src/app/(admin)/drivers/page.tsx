'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_email: string;
  license_plate: string;
  vehicle_brand: string;
  vehicle_model: string;
  verification_status: string;
  created_at: string;
}

export default function AdminDriversPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/drivers/verify');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (docId: string, status: string) => {
    try {
      await fetch('/api/admin/drivers/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, status }),
      });
      fetchDocuments();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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
            <h1 className="text-xl font-bold">Verificar Conductores</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 mb-4">
          {['', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === status ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === '' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay solicitudes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.filter(d => !filter || d.verification_status === filter).map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">{doc.driver_name}</p>
                    <p className="text-gray-500">{doc.driver_email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(doc.verification_status)}`}>
                    {doc.verification_status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Vehiculo</p>
                    <p className="font-medium">{doc.vehicle_brand} {doc.vehicle_model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patente</p>
                    <p className="font-medium uppercase">{doc.license_plate}</p>
                  </div>
                </div>

                {doc.verification_status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus(doc.id, 'approved')}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => updateStatus(doc.id, 'rejected')}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
