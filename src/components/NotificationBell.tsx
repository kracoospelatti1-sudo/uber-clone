'use client';

/**
 * Componente NotificationBell - Campana de notificaciones
 * Ultima actualizacion: 2026-03-21
 */

import { useState, useEffect, useRef } from 'react';
import { Avatar } from './Avatar';

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

interface NotificationBellProps {
  userId: string;
  userName: string;
}

export function NotificationBell({ userId, userName }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Marcar todas como leidas
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await fetch('/api/notifications/read', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear tiempo relativo
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
    return `Hace ${Math.floor(diffMins / 1440)}d`;
  };

  // Iconos segun tipo
  const getIcon = (type: string): string => {
    switch (type) {
      case 'ride_accepted': return '✓';
      case 'ride_started': return '🚗';
      case 'ride_complete': return '✓✓';
      case 'ride_cancelled': return '✕';
      case 'driver_nearby': return '📍';
      default: return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Marcar todo como leido
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-3xl">🔔</span>
                <p className="mt-2">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer
                    ${!notification.is_read ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {notification.message && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100">
            <button className="w-full text-sm text-center text-gray-600 hover:text-gray-900">
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
