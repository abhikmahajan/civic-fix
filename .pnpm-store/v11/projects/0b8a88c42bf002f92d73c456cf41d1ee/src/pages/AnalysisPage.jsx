import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrainCircuit, AlertTriangle, ArrowRight, Activity, Building, Info } from 'lucide-react';
import { api } from '../services/api.js';
import ConfidenceBadge from '../components/common/ConfidenceBadge.jsx';
import AgentActivityLog from '../components/common/AgentActivityLog.jsx';

export default function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [agentActions, setAgentActions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const data = await api.analyzeComplaint(id);
        setComplaint(data.complaint);
        setAgentActions(data.agentActions || []);
      } catch (err) {
        setError('Failed to analyze complaint. Please try again.');
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    runAnalysis();
  }, [id]);

  if (isAnalyzing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <BrainCircuit className="w-24 h-24 text-blue-600 animate-bounce relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">AI is analyzing your report...</h2>
        <p className="text-slate-500">Processing image, text, and location to classify and route your complaint.</p>
        <div className="flex gap-2 mt-4">
          {['Analyzing image', 'Processing text', 'Classifying issue', 'Finding duplicates', 'Routing department'].map((step, i) => (
            <span key={i} className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
              {step}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8 bg-red-50 rounded-xl border border-red-200">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">{error}</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Go Back
        </button>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDepartment = (dept) => {
    if (!dept) return 'General Services';
    return dept.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatProblemType = (type) => {
    if (!type) return 'Unknown';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-slate-800 mb-8 border-b pb-4">
        <BrainCircuit className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">AI Analysis Complete</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Results */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Problem Type</span>
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Info className="w-5 h-5 text-blue-500" />
                  {formatProblemType(complaint?.problemType)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Severity</span>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border uppercase ${getSeverityColor(complaint?.severity)}`}>
                    {complaint?.severity || 'Normal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Department</span>
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Building className="w-5 h-5 text-indigo-500" />
                {formatDepartment(complaint?.department)}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">AI Description</span>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {complaint?.description || 'No description generated'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Confidence Score</span>
              <ConfidenceBadge score={parseFloat(complaint?.confidence) || 0} />
            </div>
            
            {complaint?.humanReviewRequired && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex gap-3 rounded-r-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Human Review Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">This report has been flagged for manual verification.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Agent Log */}
        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col">
          <div className="bg-slate-800 p-4 flex items-center gap-2 border-b border-slate-700">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">AI Agent Activity</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
            <AgentActivityLog actions={agentActions} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <button
          onClick={() => navigate(`/complaint/${id}`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          View Full Complaint <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
        >
          Report Another Issue
        </button>
      </div>
    </div>
  );
}
