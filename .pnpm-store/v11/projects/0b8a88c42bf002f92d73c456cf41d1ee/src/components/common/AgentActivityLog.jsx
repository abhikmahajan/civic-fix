import { CheckCircle } from 'lucide-react';

const formatToolName = (name) => {
  if (!name) return 'Unknown Action';
  const map = {
    'analyze_complaint': '🔍 Analyzed complaint',
    'find_previous_complaints': '📋 Searched previous reports',
    'duplicate_detected': '🔗 Found related complaint',
    'assign_department': '🏢 Assigned department',
    'request_human_review': '👤 Requested human review',
    'escalate': '⚠️ Escalated complaint',
    'verify_resolution': '✅ Verified resolution',
    'human_review': '👤 Human review completed',
    'flag_for_review': '🏳️ Flagged for review',
    'status_update': '📊 Updated status',
  };
  return map[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function AgentActivityLog({ actions = [] }) {
  if (!actions.length) {
    return (
      <div className="text-slate-400 text-sm text-center py-4">
        No agent actions recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action, idx) => {
        let output = action.output;
        if (typeof output === 'string') {
          try { output = JSON.parse(output); } catch(e) { /* keep as string */ }
        }

        return (
          <div
            key={action.id || idx}
            className="flex gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
            style={{
              animation: `fadeInUp 0.4s ease-out ${idx * 200}ms both`,
            }}
          >
            <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={18} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-sm">
                {formatToolName(action.toolName)}
              </h4>
              {action.reason && (
                <p className="text-sm text-slate-400 mt-1">{action.reason}</p>
              )}
              {output && typeof output === 'object' && (
                <details className="mt-2 text-sm">
                  <summary className="font-medium text-slate-500 cursor-pointer hover:text-slate-300 select-none text-xs">
                    View details
                  </summary>
                  <pre className="mt-2 text-xs text-slate-400 whitespace-pre-wrap font-mono bg-slate-900/50 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </details>
              )}
              {action.createdAt && (
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(action.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
