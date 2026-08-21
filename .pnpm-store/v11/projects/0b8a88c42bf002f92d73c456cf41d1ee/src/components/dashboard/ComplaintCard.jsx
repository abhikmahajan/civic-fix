import { AlertCircle, ArrowUpRight } from 'lucide-react';
import ConfidenceBadge from '../common/ConfidenceBadge.jsx';

export default function ComplaintCard({ data }) {
  const complaint = data;
  
  const borderColors = {
    critical: 'border-l-red-600',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-400',
    low: 'border-l-green-500'
  };

  const severityBadgeColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  const severityColor = borderColors[complaint.severity?.toLowerCase()] || 'border-l-gray-300';
  const idShort = complaint.id ? complaint.id.substring(0, 8).toUpperCase() : 'N/A';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 ${severityColor} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900 capitalize truncate">
            {complaint.problemType?.replace(/_/g, ' ') || 'Unknown Issue'}
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-400">#{idShort}</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${severityBadgeColors[complaint.severity] || 'bg-gray-100 text-gray-600'}`}>
          {complaint.severity || 'unknown'}
        </span>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
          {complaint.status?.replace(/_/g, ' ') || 'pending'}
        </span>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full truncate max-w-[140px] capitalize">
          {complaint.department?.replace(/_/g, ' ') || 'Unassigned'}
        </span>
      </div>

      {complaint.confidence && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">AI Confidence</span>
          <ConfidenceBadge score={parseFloat(complaint.confidence) || 0} />
        </div>
      )}
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">
          {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : ''}
        </span>
        <div className="flex items-center text-xs font-medium text-blue-600">
          <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
}
