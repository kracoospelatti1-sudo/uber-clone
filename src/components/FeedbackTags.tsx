'use client';

export const PASSENGER_TAGS = [
  { id: 'puntual', label: '⏰ Puntual' },
  { id: 'buen_manejo', label: '🚗 Buen manejo' },
  { id: 'amable', label: '😊 Amable' },
  { id: 'silencioso', label: '🤫 Silencioso' },
  { id: 'auto_limpio', label: '✨ Auto limpio' },
  { id: 'musica_agradable', label: '🎵 Música agradable' },
  { id: 'conoce_la_ciudad', label: '🗺️ Conoce la ciudad' },
  { id: 'profesional', label: '👔 Profesional' },
];

export const DRIVER_TAGS = [
  { id: 'puntual', label: '⏰ Puntual' },
  { id: 'respetuoso', label: '🤝 Respetuoso' },
  { id: 'buen_pasajero', label: '👍 Buen pasajero' },
  { id: 'claro_con_destino', label: '📍 Claro con el destino' },
  { id: 'sin_cancelaciones', label: '✅ Sin cancelaciones' },
];

interface FeedbackTagsProps {
  tags: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function FeedbackTags({ tags, selected, onToggle }: FeedbackTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => onToggle(tag.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              isSelected
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
            }`}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}
