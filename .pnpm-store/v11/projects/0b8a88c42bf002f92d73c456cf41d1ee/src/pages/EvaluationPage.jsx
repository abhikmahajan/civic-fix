import { useState } from 'react';
import { FlaskConical, Play, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { api } from '../services/api.js';

export default function EvaluationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const data = await api.runEvaluation();
      setResults(data);
    } catch (err) {
      console.error('Evaluation error:', err);
      alert('Failed to run evaluation.');
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderProgressBar = (label, percentage) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full ${getScoreColor(percentage)} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-slate-900">AI Evaluation Harness</h1>
        </div>
        
        <button
          onClick={handleRunEvaluation}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          {isRunning ? (
             <span className="flex items-center gap-2 animate-pulse">
               <FlaskConical className="w-5 h-5 animate-spin" /> Running 20 test cases...
             </span>
          ) : (
            <><Play className="w-5 h-5" /> Run Evaluation</>
          )}
        </button>
      </div>

      {!results && !isRunning && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-medium mb-2">Ready to test AI performance</h2>
          <p>Click "Run Evaluation" to process the standardized test suite against the current LLM configuration.</p>
        </div>
      )}

      {results && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col justify-center items-center text-center">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Overall Accuracy</span>
              <span className={`text-6xl font-black ${
                results.accuracy.overall >= 85 ? 'text-green-600' : results.accuracy.overall >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {results.accuracy.overall}%
              </span>
            </div>
            
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {renderProgressBar('Classification', results.accuracy.classification)}
              {renderProgressBar('Severity Scoring', results.accuracy.severity)}
              {renderProgressBar('Department Routing', results.accuracy.department)}
              {renderProgressBar('Conflict Resolution', results.accuracy.conflict)}
              {renderProgressBar('Resolution Verification', results.accuracy.resolution)}
            </div>
          </div>

          {/* Test Results Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Detailed Test Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID</th>
                    <th className="px-6 py-4 font-semibold">Test Name</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Expected</th>
                    <th className="px-6 py-4 font-semibold">Actual</th>
                    <th className="px-6 py-4 font-semibold text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.results.map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">{tc.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{tc.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">{tc.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{tc.expected}</td>
                      <td className="px-6 py-4 text-slate-600">{tc.actual}</td>
                      <td className="px-6 py-4 text-center">
                        {tc.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
