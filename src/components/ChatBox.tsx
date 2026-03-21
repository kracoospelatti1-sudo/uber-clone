'use client';

/**
 * Componente ChatBox - Chat entre conductor y pasajero
 * Ultima actualizacion: 2026-03-21
 * Mobile-first responsive design
 */

import { useState, useEffect, useRef } from 'react';
import { Avatar } from './Avatar';

interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatBoxProps {
  rideId: string;
  currentUserId: string;
  currentUserName: string;
  otherUserName: string;
  otherUserAvatar?: string | null;
}

export function ChatBox({ 
  rideId, 
  currentUserId, 
  currentUserName, 
  otherUserName,
  otherUserAvatar 
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar mensajes
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${rideId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Polling cada 3 segundos
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  // Scroll al ultimo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/chat/${rideId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear tiempo
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <Avatar name={otherUserName} imageUrl={otherUserAvatar} size="md" />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{otherUserName}</p>
          <p className="text-sm text-gray-500">Conductor</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <span className="text-4xl">💬</span>
            <p className="mt-2">Sin mensajes aun</p>
            <p className="text-sm">Envia un mensaje para comunicarte</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] px-4 py-2 rounded-2xl text-sm
                    ${isOwn 
                      ? 'bg-black text-white rounded-br-md' 
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                    }
                  `}
                >
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-base focus:ring-2 focus:ring-black focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center disabled:bg-gray-300 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
