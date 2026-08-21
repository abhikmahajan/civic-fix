import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export default function ConfidenceBadge({ score }) {
  if (score == null) return null;
  const percentage = Math.round(score * 100);
  let colorClass = 'bg-red-100 text-red-800 border-red-200';
  let Icon = ShieldAlert;

  if (score > 0.9) {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
    Icon = ShieldCheck;
  } else if (score >= 0.5) {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    Icon = Shield;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <Icon size={14} />
      {percentage}% Confidence
    </span>
  );
}
