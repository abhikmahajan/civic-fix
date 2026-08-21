import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Building, Calendar, AlertCircle, Camera, CheckCircle, Upload } from 'lucide-react';
import { api, assetUrl } from '../services/api.js';
import StatusTimeline from '../components/common/StatusTimeline.jsx';
import AgentActivityLog from '../components/common/AgentActivityLog.jsx';
import ConfidenceBadge from '../components/common/ConfidenceBadge.jsx';

export default function ComplaintPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await api.getComplaint(id);
        setData(response);
      } catch (error) {
        console.error('Error fetching complaint:', error);
        setError(error.message || 'Unable to load this complaint.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleVerifyResolution = async () => {
    if (!resolutionFile) return;
    setVerifying(true);
    try {
      const formData = new FormData();
      formData.append('image', resolutionFile);
      const result = await api.verifyComplaint(id, formData);
      setVerificationResult(result);
      const updated = await api.getComplaint(id);
      setData(updated);
    } catch (err) {
      console.error(err);
      alert('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading complaint details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">{error || 'Complaint not found.'}</div>;

  const { complaint, evidence = [], agentActions = [] } = data;

  const severityColor = complaint.severity === 'high' || complaint.severity === 'critical' 
    ? 'bg-red-100 text-red-800' 
    : complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

  const formatDept = (d) => d ? d.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unassigned';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Complaint #{id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full capitalize">
              {complaint.problemType || 'Unknown'}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full uppercase ${severityColor}`}>
              {complaint.severity || 'normal'}
            </span>
          </div>
        </div>
        <ConfidenceBadge score={parseFloat(complaint.confidence) || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Status Timeline</h2>
            <StatusTimeline currentStatus={complaint.status} agentActions={agentActions} />
          </div>
          {complaint.status === 'needs_review' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 text-yellow-800">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold">Human Review Required</p>
                <p className="text-sm mt-1">Awaiting manual validation from an operator.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Building className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{formatDept(complaint.department)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium text-slate-900">{complaint.latitude || '—'}, {complaint.longitude || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Created</p>
                    <p className="font-medium text-slate-900">{new Date(complaint.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {complaint.authorityTicketId && (
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Authority Ticket</p>
                      <p className="font-medium text-slate-900">{complaint.authorityTicketId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-2">Description</p>
              <p className="text-slate-800 bg-slate-50 p-4 rounded-lg">{complaint.description || complaint.originalDescription || 'No description'}</p>
            </div>
          </div>

          {/* Evidence Gallery */}
          {evidence.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" /> Evidence Photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {evidence.map((ev, i) => (
                  <div key={ev.id || i} className="relative">
                    <img src={assetUrl(ev.fileUrl)} alt={`Evidence ${i + 1}`} className="rounded-lg object-cover w-full h-40 border border-slate-200" />
                    <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded capitalize">{ev.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Upload */}
          {(complaint.status === 'in_progress' || complaint.status === 'awaiting_verification' || complaint.status === 'assigned') && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
              <h2 className="text-lg font-bold text-indigo-900 mb-2">Upload Resolution Photo</h2>
              <p className="text-indigo-700 text-sm mb-4">Fix completed? Upload a photo for AI verification.</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setResolutionFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                />
                <button
                  onClick={handleVerifyResolution}
                  disabled={!resolutionFile || verifying}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {verifying ? 'Verifying...' : <><Upload className="w-4 h-4" /> Verify Resolution</>}
                </button>
              </div>
              {verificationResult && (
                <div className={`mt-4 p-4 rounded-lg border flex gap-3 ${verificationResult.resolved ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  {verificationResult.resolved ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
                  <div>
                    <p className="font-semibold">{verificationResult.resolved ? 'Resolution Verified!' : 'Issue Not Resolved'}</p>
                    <p className="text-sm mt-1">Confidence: {((verificationResult.confidence || 0) * 100).toFixed(0)}%</p>
                    <p className="text-sm mt-1">{verificationResult.reasoning}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agent Actions */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <div className="bg-slate-800 p-4 border-b border-slate-700">
              <h2 className="font-bold text-white">AI Agent Actions</h2>
            </div>
            <div className="p-6">
              <AgentActivityLog actions={agentActions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
