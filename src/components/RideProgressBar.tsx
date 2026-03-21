'use client';

type RideStatus = 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled';

interface Step {
  key: RideStatus | string;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { key: 'requested', label: 'Solicitado', icon: '📍' },
  { key: 'accepted', label: 'Conductor en camino', icon: '🚗' },
  { key: 'started', label: 'En viaje', icon: '🛣️' },
  { key: 'completed', label: 'Completado', icon: '✅' },
];

const STATUS_INDEX: Record<string, number> = {
  requested: 0,
  accepted: 1,
  started: 2,
  completed: 3,
};

interface RideProgressBarProps {
  status: RideStatus;
}

export function RideProgressBar({ status }: RideProgressBarProps) {
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <span className="text-2xl">❌</span>
        <p className="text-red-700 font-semibold mt-1">Viaje cancelado</p>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line behind steps */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 mx-6" />
        <div
          className="absolute left-6 top-5 h-0.5 bg-green-500 transition-all duration-700"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * (100 - 12)}%` }}
        />

        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                  done
                    ? 'bg-green-500 shadow-lg ' + (active ? 'ring-4 ring-green-200 scale-110' : '')
                    : 'bg-gray-200'
                }`}
              >
                {step.icon}
              </div>
              <p className={`text-xs mt-1 text-center leading-tight ${done ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
