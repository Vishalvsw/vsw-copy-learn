import React from 'react';
import { ShieldAlert, Clock, User, Shield } from 'lucide-react';
import { AuditLog } from '../../types';

interface AdminAuditLogsProps {
  logs: AuditLog[];
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">Administrative Security Audit Trail</h2>
        <p className="text-xs text-slate-400">
          Immutable chronological ledger tracking all administrative configuration, price adjustments, and manual access grants.
        </p>
      </div>

      <div className="border border-slate-800 rounded-2xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>{log.adminEmail}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-md">{log.details}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {log.targetType ? `${log.targetType}: ${log.targetId || ''}` : 'System'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
