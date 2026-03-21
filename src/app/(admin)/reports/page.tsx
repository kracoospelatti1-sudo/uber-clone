'use client';

/**
 * Pagina de reportes para admin
 * Ultima actualizacion: 2026-03-21
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_id: string;
  reported_name: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [resolving, setResolving] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/admin/reports?filter=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filter]);

  const resolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    setResolving(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    } finally {
      setResolving(null);
    }
  };

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      'inappropriate_behavior': 'Comportamiento inapropiado',
      'vehicle_condition': 'Condicion del vehiculo',
      'safety': '安全问题',
      'other': 'Otro',
    };
    return labels[reason] || reason;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-black text-white p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Reportes</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            <span className="text-4xl">📋</span>
            <p className="mt-2">No hay reportes {filter === 'pending' ? 'pendientes' : ''}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status === 'pending' ? 'Pendiente' :
                     report.status === 'resolved' ? 'Resuelto' : 'Descartado'}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(report.created_at)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Reporta</p>
                    <div className="flex items-center gap-2">
                      <Avatar name={report.reporter_name} size="sm" />
                      <span className="font-medium">{report.reporter_name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reportado</p>
                    <div className="flex items-center gap-2">
                      <Avatar name={report.reported_name} size="sm" />
                      <span className="font-medium">{report.reported_name}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-500">Razon</p>
                  <p className="font-medium">{getReasonLabel(report.reason)}</p>
                </div>

                {report.description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Descripcion</p>
                    <p className="text-sm">{report.description}</p>
                  </div>
                )}

                {report.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => resolveReport(report.id, 'resolved')}
                      disabled={resolving === report.id}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                    >
                      Resolver
                    </button>
                    <button
                      onClick={() => resolveReport(report.id, 'dismissed')}
                      disabled={resolving === report.id}
                      className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50"
                    >
                      Descartar
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
