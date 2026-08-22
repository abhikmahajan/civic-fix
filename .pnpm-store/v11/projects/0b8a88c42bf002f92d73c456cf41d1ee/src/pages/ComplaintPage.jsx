import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Building, Calendar, AlertCircle, Camera, CheckCircle, Upload, RefreshCw, XCircle, Clock } from 'lucide-react';
import { api, assetUrl } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusTimeline from '../components/common/StatusTimeline.jsx';
import AgentActivityLog from '../components/common/AgentActivityLog.jsx';
import ConfidenceBadge from '../components/common/ConfidenceBadge.jsx';

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700' },
  analyzing: { label: 'Analyzing', color: 'bg-blue-100 text-blue-700' },
  classified: { label: 'Classified', color: 'bg-indigo-100 text-indigo-700' },
  needs_review: { label: 'Needs Review', color: 'bg-yellow-100 text-yellow-700' },
  assigned: { label: 'Assigned', color: 'bg-cyan-100 text-cyan-700' },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
  awaiting_verification: { label: 'Awaiting Verification', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  reopened: { label: 'Reopened', color: 'bg-red-100 text-red-700' },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800' },
  closed: { label: 'Closed', color: 'bg-slate-200 text-slate-600' },
};

export default function ComplaintPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showReupload, setShowReupload] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { isManagement } = useAuth();

  const fetchComplaint = useCallback(async () => {
    try {
      const response = await api.getComplaint(id);
      setData(response);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      setError(err.message || 'Unable to load this complaint.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 1200;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) { height *= MAX_DIM / width; width = MAX_DIM; }
            else { width *= MAX_DIM / height; height = MAX_DIM; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleVerifyResolution = async () => {
    if (!resolutionFile) return;
    setVerifying(true);
    setVerificationResult(null);
    try {
      const compressedFile = await compressImage(resolutionFile);
      const formData = new FormData();
      formData.append('image', compressedFile);
      const result = await api.verifyComplaint(id, formData);
      setVerificationResult(result);
      // Re-fetch to get updated status from backend
      await fetchComplaint();
      // If not resolved, show re-upload option
      if (!result.resolved) {
        setShowReupload(true);
        setResolutionFile(null);
      }
    } catch (err) {
      console.error(err);
      setVerificationResult({ error: err.message || 'Verification failed.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleReupload = () => {
    setVerificationResult(null);
    setShowReupload(false);
    setResolutionFile(null);
  };

  if (loading) return (
    <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
      <span>Loading complaint details...</span>
    </div>
  );
  if (!data) return <div className="p-8 text-center text-red-500">{error || 'Complaint not found.'}</div>;

  const { complaint, evidence = [], agentActions = [] } = data;

  const severityColor = complaint.severity === 'high' || complaint.severity === 'critical'
    ? 'bg-red-100 text-red-800'
    : complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

  const formatDept = (d) => d ? d.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Unassigned';

  const statusInfo = STATUS_LABELS[complaint.status] || { label: complaint.status, color: 'bg-slate-100 text-slate-700' };

  const canVerify = isManagement && ['assigned', 'in_progress', 'awaiting_verification'].includes(complaint.status);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === complaint.status) return;
    if (confirm(`Change status to ${STATUS_LABELS[newStatus]?.label || newStatus}?`)) {
      setUpdatingStatus(true);
      try {
        await api.updateStatus(id, newStatus);
        await fetchComplaint();
      } catch (err) {
        console.error('Failed to update status:', err);
        alert(err.message || 'Failed to update status');
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Complaint #{id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-semibold rounded-full capitalize">
              {complaint.problemType || 'Unknown'}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full uppercase ${severityColor}`}>
              {complaint.severity || 'normal'}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isManagement && data.validTransitions && data.validTransitions.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <label htmlFor="status-select" className="text-sm font-medium text-slate-600">Change Status:</label>
              <select
                id="status-select"
                className="bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 disabled:opacity-50"
                value={complaint.status}
                onChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <option value={complaint.status}>{statusInfo.label} (Current)</option>
                {data.validTransitions.map(st => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]?.label || st}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={fetchComplaint}
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${updatingStatus ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <ConfidenceBadge score={parseFloat(complaint.confidence) || 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Status Timeline</h2>
            <StatusTimeline currentStatus={complaint.status} agentActions={agentActions} />
          </div>

          {/* Status-specific banners for citizens */}
          {complaint.status === 'needs_review' && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 text-yellow-800">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Under Manual Review</p>
                <p className="text-sm mt-1">An operator is reviewing this complaint.</p>
              </div>
            </div>
          )}
          {complaint.status === 'in_progress' && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3 text-orange-800">
              <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Work In Progress</p>
                <p className="text-sm mt-1">The assigned team is working on fixing this issue.</p>
              </div>
            </div>
          )}
          {complaint.status === 'resolved' && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex gap-3 text-green-800">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Issue Resolved</p>
                <p className="text-sm mt-1">This complaint has been verified and closed.</p>
              </div>
            </div>
          )}
          {complaint.status === 'escalated' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-800">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Escalated</p>
                <p className="text-sm mt-1">This issue has been escalated for urgent attention.</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{formatDept(complaint.department)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium text-slate-900">
                      {complaint.latitude && complaint.longitude
                        ? `${parseFloat(complaint.latitude).toFixed(4)}, ${parseFloat(complaint.longitude).toFixed(4)}`
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Reported</p>
                    <p className="font-medium text-slate-900">{new Date(complaint.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {complaint.authorityTicketId && (
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Authority Ticket</p>
                      <p className="font-medium text-slate-900 font-mono">{complaint.authorityTicketId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-2">Description</p>
              <p className="text-slate-800 bg-slate-50 p-4 rounded-lg leading-relaxed">
                {complaint.description || complaint.originalDescription || 'No description'}
              </p>
            </div>
            {complaint.aiReasoning && (
              <div className="mt-4">
                <p className="text-sm text-slate-500 mb-2">AI Reasoning</p>
                <p className="text-slate-600 bg-blue-50 p-4 rounded-lg text-sm leading-relaxed italic">
                  {complaint.aiReasoning}
                </p>
              </div>
            )}
          </div>

          {/* Evidence Gallery */}
          {evidence.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" /> Evidence Photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {evidence.map((ev, i) => (
                  <div key={ev.id || i} className="relative group">
                    <img
                      src={assetUrl(ev.fileUrl)}
                      alt={`Evidence ${i + 1}`}
                      className="rounded-lg object-cover w-full h-40 border border-slate-200"
                      onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                    />
                    <span className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded font-medium capitalize
                      ${ev.type === 'resolution_photo' ? 'bg-green-600 text-white' : 'bg-black/60 text-white'}`}>
                      {ev.type === 'resolution_photo' ? '✓ Resolution' : ev.type?.replace('_', ' ') || 'photo'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Upload — MANAGEMENT ONLY */}
          {isManagement && canVerify && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
              <h2 className="text-lg font-bold text-indigo-900 mb-1">
                {showReupload ? '🔄 Re-upload Resolution Photo' : 'Upload Resolution Photo'}
              </h2>
              <p className="text-indigo-700 text-sm mb-4">
                {showReupload
                  ? 'The previous image did not confirm the issue is fixed. Please upload a new, clearer photo showing the resolved issue.'
                  : 'Work completed? Upload an after-photo for AI verification.'}
              </p>

              {/* Verification result feedback */}
              {verificationResult && !verificationResult.error && (
                <div className={`mb-4 p-4 rounded-lg border flex gap-3 ${verificationResult.resolved
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'}`}>
                  {verificationResult.resolved
                    ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {verificationResult.resolved ? 'Issue Verified as Resolved!' : 'Issue Not Yet Resolved'}
                    </p>
                    <p className="text-sm mt-1">
                      AI Confidence: {((verificationResult.confidence || 0) * 100).toFixed(0)}%
                    </p>
                    {verificationResult.reasoning && (
                      <p className="text-sm mt-1 italic">{verificationResult.reasoning}</p>
                    )}
                    {!verificationResult.resolved && (
                      <button
                        onClick={handleReupload}
                        className="mt-3 inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Upload New Photo
                      </button>
                    )}
                  </div>
                </div>
              )}

              {verificationResult?.error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Verification Error</p>
                    <p className="text-sm">{verificationResult.error}</p>
                    <button onClick={handleReupload} className="mt-2 text-sm underline">Try again</button>
                  </div>
                </div>
              )}

              {/* Upload form — show initially or after clicking re-upload */}
              {(!verificationResult || showReupload) && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <input
                    key={showReupload ? 'reupload' : 'initial'}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolutionFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer"
                  />
                  <button
                    onClick={handleVerifyResolution}
                    disabled={!resolutionFile || verifying}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {verifying
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</>
                      : <><Upload className="w-4 h-4" /> {showReupload ? 'Re-verify' : 'Verify Resolution'}</>}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI Agent Actions Log */}
          {agentActions.length > 0 && (
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
              <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <h2 className="font-bold text-white">AI Agent Activity Log</h2>
              </div>
              <div className="p-6">
                <AgentActivityLog actions={agentActions} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
