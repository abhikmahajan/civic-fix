import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertOctagon, Eye, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Assuming these exist
import ComplaintCard from '../components/dashboard/ComplaintCard.jsx';
import HumanReviewModal from '../components/dashboard/HumanReviewModal.jsx';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigate = useNavigate();
  const { isManagement } = useAuth();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setError('');
        const data = await api.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Unable to load complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const stats = {
    highPriority: complaints.filter(c => c.severity === 'high' || c.severity === 'critical').length,
    needsReview: complaints.filter(c => c.status === 'needs_review').length,
    inProgress: complaints.filter(c => ['in_progress', 'assigned'].includes(c.status)).length,
    resolved: complaints.filter(c => ['resolved', 'closed'].includes(c.status)).length,
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return c.status === 'pending';
    if (filter === 'Needs Review') return c.status === 'needs_review';
    if (filter === 'In Progress') return ['in_progress', 'assigned'].includes(c.status);
    if (filter === 'Resolved') return ['resolved', 'closed'].includes(c.status);
    if (filter === 'Escalated') return c.status === 'escalated';
    return true;
  });

  const handleCardClick = (complaint) => {
    if (isManagement && complaint.status === 'needs_review') {
      setSelectedComplaint(complaint);
      setShowReviewModal(true);
    } else {
      navigate(`/complaint/${complaint.id}`);
    }
  };

  const handleReviewComplete = (action) => {
    setShowReviewModal(false);
    setSelectedComplaint(null);
    // Optimistic update
    setComplaints(prev => prev.map(c => 
      c.id === selectedComplaint.id ? { ...c, status: action === 'approve' ? 'assigned' : action === 'reject' ? 'closed' : 'needs_review' } : c
    ));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <LayoutDashboard className="w-8 h-8 text-slate-800" />
        <h1 className="text-3xl font-bold text-slate-900">
          {isManagement ? 'BetterBharat Command Center' : 'My Complaints'}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load data: {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg"><AlertOctagon className="w-6 h-6 text-red-600" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">High Priority</p>
            <p className="text-2xl font-bold text-slate-900">{stats.highPriority}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg"><Eye className="w-6 h-6 text-yellow-600" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Needs Review</p>
            <p className="text-2xl font-bold text-slate-900">{stats.needsReview}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Needs Review', 'In Progress', 'Resolved', 'Escalated'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f 
                ? 'bg-slate-800 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading complaints…</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No complaints found for this filter.
          </div>
        ) : (
          filteredComplaints.map(complaint => (
            <div key={complaint.id} onClick={() => handleCardClick(complaint)} className="cursor-pointer">
              <ComplaintCard data={complaint} />
            </div>
          ))
        )}
      </div>

      {/* Human Review Modal (Management Only) */}
      {isManagement && showReviewModal && selectedComplaint && (
        <HumanReviewModal 
          complaint={selectedComplaint} 
          onClose={() => setShowReviewModal(false)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}
