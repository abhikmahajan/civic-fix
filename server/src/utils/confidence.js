export function getConfidenceLevel(score) {
  const num = parseFloat(score);
  if (num > 0.9) return 'high';
  if (num >= 0.5) return 'medium';
  return 'low';
}

export function shouldAutomate(score, actionRisk) {
  const num = parseFloat(score);
  if (num > 0.9 && actionRisk === 'low') return true;
  if (num >= 0.5 && num <= 0.9 && actionRisk === 'low') return true;
  return false;
}

export function formatConfidence(score) {
  const num = parseFloat(score);
  if (isNaN(num)) return '0%';
  return `${Math.round(num * 100)}%`;
}
