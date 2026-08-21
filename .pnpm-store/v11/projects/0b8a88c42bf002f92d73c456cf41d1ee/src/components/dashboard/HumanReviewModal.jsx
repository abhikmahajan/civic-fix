import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api.js';

export default function HumanReviewModal({ complaint, onClose, onComplete }) {
  if (!complaint) return null;

  const handleDecision = async (decision) => {
    try {
      await api.reviewComplaint(complaint.id, { decision, notes: `Operator ${decision} via dashboard` });
      if (onComplete) onComplete(decision);
    } catch (err) {
      console.error('Review failed:', err);
      alert('Failed to submit review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" /> Human Review Required
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
            <strong>Reason for review:</strong> AI confidence is below the threshold for automatic processing.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="text-sm bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700">{complaint.description || complaint.originalDescription || 'No description available.'}</p>
              </div>
              {complaint.aiReasoning && (
                <div className="mt-3 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <strong className="text-blue-800">AI Reasoning:</strong>
                  <p className="text-blue-700 mt-1">{complaint.aiReasoning}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium capitalize">{complaint.problemType?.replace(/_/g, ' ') || 'Unknown'}</span>
                </li>
                <li className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Severity:</span>
                  <span className="font-medium capitalize">{complaint.severity || 'Unknown'}</span>
                </li>
                <li className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-medium capitalize">{complaint.department?.replace(/_/g, ' ') || 'Unassigned'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">Confidence:</span>
                  <span className="font-medium">
                    {complaint.confidence ? `${(parseFloat(complaint.confidence) * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex flex-wrap justify-end gap-3 z-10">
          <button
            onClick={() => handleDecision('reject')}
            className="px-5 py-2.5 flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors"
          >
            <XCircle size={18} /> Reject
          </button>
          <button
            onClick={() => handleDecision('request_more')}
            className="px-5 py-2.5 flex items-center gap-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium transition-colors"
          >
            <AlertTriangle size={18} /> Request More Evidence
          </button>
          <button
            onClick={() => handleDecision('approve')}
            className="px-5 py-2.5 flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors"
          >
            <CheckCircle size={18} /> Approve & Route
          </button>
        </div>
      </div>
    </div>
  );
}
