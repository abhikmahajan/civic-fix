import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const statuses = [
  'pending', 'analyzing', 'classified', 'assigned',
  'in_progress', 'awaiting_verification', 'resolved', 'closed'
];

export default function StatusTimeline({ currentStatus, agentActions = [] }) {
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-4">
      {statuses.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        
        return (
          <div key={status} className="flex items-start gap-3">
            <div className="mt-1 relative">
              {isCompleted ? (
                <CheckCircle2 className="text-green-500 w-5 h-5" />
              ) : isCurrent ? (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <Circle className="text-gray-300 w-5 h-5" />
              )}
              {index < statuses.length - 1 && (
                <div className={`absolute top-6 bottom-[-16px] left-[9px] w-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium capitalize ${isFuture ? 'text-gray-400' : 'text-gray-900'}`}>
                {status.replace('_', ' ')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
