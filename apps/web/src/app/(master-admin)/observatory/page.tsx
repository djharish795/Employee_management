"use client";

import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMasterAdminToken, clearMasterAdminToken } from '@/components/master-admin/MasterAdminEntryPoint';
import { 
  Activity, Database, ShieldAlert, Users, 
  SquareTerminal, Shield, AlertTriangle, Monitor, History, Smartphone,
  CheckCircle2, Key, Unlock, Lock, UserX, Search, X
} from 'lucide-react';
import { PremiumCard } from '@/components/shared/premium-dashboard'; // if it exists, otherwise just raw tailwind

import { io, Socket } from 'socket.io-client';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Bar } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

function apiFetch(path: string, token: string, options?: RequestInit) {
  return fetch(`${API}/api/v1/master-admin${path}`, {
    ...options,
    headers: { 'x-master-admin-token': token, 'Content-Type': 'application/json', ...(options?.headers || {}) },
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'API Error');
    return data;
  });
}

function ObservatoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'live';

  const [token, setToken] = useState<string | null>(null);
  const [liveNow, setLiveNow] = useState<any[]>([]);
  const [deepAudit, setDeepAudit] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success'|'error', text: string } | null>(null);
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  
  // Deep Dive State
  const [selectedEmployeeForDive, setSelectedEmployeeForDive] = useState<any | null>(null);
  const [diveTimeline, setDiveTimeline] = useState<any[]>([]);
  const [diveLoading, setDiveLoading] = useState(false);

  // Health Radar & Command Center State
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [killSwitchAction, setKillSwitchAction] = useState<{ userId: string; action: string; title: string; endpoint: string; method: string; body?: any } | null>(null);
  const [killSwitchPassword, setKillSwitchPassword] = useState('');
  const [executingKill, setExecutingKill] = useState(false);

  // Tier 4: God Eye Network Tracer & Firewall State
  const [networkTraces, setNetworkTraces] = useState<any[]>([]);
  const [bannedIpInput, setBannedIpInput] = useState('');
  const [isBanningIp, setIsBanningIp] = useState(false);

  useEffect(() => {
    const t = getMasterAdminToken();
    if (!t) { router.replace('/master-auth'); return; }
    setToken(t);
  }, [router]);

  const showMsg = (type: 'success'|'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const loadData = useCallback(async (t: string) => {
    if (activeTab === 'live') return; // Handled by WebSocket
    setLoading(true);
    try {
      if (activeTab === 'audit') {
        const auditData = await apiFetch('/audit', t); // Now it's /audit
        setDeepAudit(Array.isArray(auditData) ? auditData : []);
      } else if (activeTab === 'crewbase') {
        const empData = await apiFetch('/employees', t);
        setEmployees(Array.isArray(empData) ? empData : []);
      } else if (activeTab === 'security') {
        const alertData = await apiFetch('/security-alerts?limit=50', t);
        setAlerts(alertData?.data || []);
      } else if (activeTab === 'analytics') {
        const histData = await apiFetch('/analytics/history', t);
        setHistory(Array.isArray(histData) ? histData : []);
      } else if (activeTab === 'anomalies') {
        const anomData = await apiFetch('/analytics/anomalies', t);
        setAnomalies(Array.isArray(anomData) ? anomData : []);
      } else if (activeTab === 'health') {
        const healthData = await apiFetch('/system/health', t);
        setSystemHealth(healthData);
      }
      
      // Always load maintenance status for the global switch
      const maintData = await apiFetch('/system/maintenance-status', t);
      setMaintenanceEnabled(maintData.enabled);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (!token) return;
    loadData(token);
    
    let socket: Socket | null = null;
    if (activeTab === 'live' || activeTab === 'tracer') {
      setLoading(true);
      socket = io(`${API}/master-admin-telemetry`, {
        auth: { token },
        transports: ['websocket']
      });

      socket.on('connect', () => {
        console.log('Zero-latency telemetry connected');
      });

      socket.on('telemetry_update', (data) => {
        setLiveNow(Array.isArray(data) ? data : []);
        setLoading(false);
      });

      socket.on('network_trace', (trace) => {
        setNetworkTraces((prev) => {
          const updated = [trace, ...prev].slice(0, 100); // Keep last 100 traces
          return updated;
        });
      });

      socket.on('disconnect', () => {
        console.log('Telemetry disconnected');
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, activeTab, loadData]);

  const forceAction = async (endpoint: string, successMsg: string, confirmMsg: string) => {
    if (!token || !confirm(confirmMsg)) return;
    try {
      await apiFetch(endpoint, token, { method: 'PUT' });
      showMsg('success', successMsg);
    } catch (e: any) {
      showMsg('error', e.message);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'health' && token) {
      interval = setInterval(async () => {
        try {
          const healthData = await apiFetch('/system/health', token);
          setSystemHealth(healthData);
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, token]);

  const executeKillAction = async () => {
    if (!token || !killSwitchAction) return;
    if (killSwitchPassword.trim() === '') {
      showMsg('error', 'Password is required to execute God Mode commands.');
      return;
    }
    setExecutingKill(true);
    try {
      await apiFetch(killSwitchAction.endpoint, token, { 
        method: killSwitchAction.method,
        body: killSwitchAction.body ? JSON.stringify(killSwitchAction.body) : undefined
      });
      showMsg('success', `${killSwitchAction.title} executed successfully.`);
      setKillSwitchAction(null);
      setKillSwitchPassword('');
    } catch (e: any) {
      showMsg('error', e.message);
    }
    setExecutingKill(false);
  };

  const handleIpBan = async () => {
    if (!token || !bannedIpInput.trim()) return;
    if (!confirm(`Are you sure you want to completely ban ${bannedIpInput} across the entire organization?`)) return;
    setIsBanningIp(true);
    try {
      await apiFetch('/system/firewall/block', token, { method: 'POST', body: JSON.stringify({ ip: bannedIpInput.trim() }) });
      showMsg('success', `IP ${bannedIpInput} has been blocked.`);
      setBannedIpInput('');
    } catch (e: any) { showMsg('error', e.message); }
    setIsBanningIp(false);
  };

  const resolveAlert = async (alertId: string) => {
    if (!token) return;
    try {
      await apiFetch(`/security-alerts/${alertId}/resolve`, token, { method: 'PUT' });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      showMsg('success', 'Alert resolved.');
    } catch(e: any) { showMsg('error', e.message); }
  };

  const openDeepDive = async (employeeId: string, employeeData: any) => {
    setSelectedEmployeeForDive(employeeData);
    setDiveLoading(true);
    try {
      const data = await apiFetch(`/employee/${employeeId}/timeline?limit=100`, token!);
      setDiveTimeline(data?.data || []);
    } catch(e: any) {
      showMsg('error', e.message);
    }
    setDiveLoading(false);
  };

  const toggleMaintenance = async () => {
    if (!token) return;
    const action = maintenanceEnabled ? 'disable' : 'ENABLE';
    if (!confirm(`Are you sure you want to ${action} GLOBAL MAINTENANCE MODE? If enabled, all employees will be locked out immediately.`)) return;
    try {
      const res = await apiFetch('/system/maintenance', token, {
        method: 'POST',
        body: JSON.stringify({ enable: !maintenanceEnabled })
      });
      setMaintenanceEnabled(res.enabled);
      showMsg('success', res.enabled ? 'Maintenance Mode ENABLED. System locked.' : 'Maintenance Mode DISABLED. System unlocked.');
    } catch (e: any) {
      showMsg('error', e.message);
    }
  };

  const trafficData = useMemo(() => {
    const buckets: Record<string, { timestamp: string, volume: number, uniqueUsers: Set<string> }> = {};
    
    history.forEach(h => {
      const date = new Date(h.timestamp);
      date.setSeconds(0, 0); // truncate to minute
      const key = date.toISOString();
      if (!buckets[key]) {
        buckets[key] = { timestamp: key, volume: 0, uniqueUsers: new Set() };
      }
      buckets[key].volume += 1;
      buckets[key].uniqueUsers.add(h.employeeId);
    });

    return Object.values(buckets)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(b => ({
        ...b,
        uniqueUsersCount: b.uniqueUsers.size
      }))
      .slice(-100);
  }, [history]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SquareTerminal className="w-7 h-7 text-red-500" />
            {activeTab === 'live' && 'Live Telemetry'}
            {activeTab === 'analytics' && 'Historical Analytics & Traffic'}
            {activeTab === 'anomalies' && 'Anomaly Radar'}
            {activeTab === 'audit' && 'Deep Audit Logs'}
            {activeTab === 'crewbase' && 'Crewbase Core Control'}
            {activeTab === 'security' && 'Security Operations Center'}
            {activeTab === 'health' && 'System Health Radar'}
            {activeTab === 'tracer' && 'Global Network Tracer'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Master Administrator God-Mode Interface</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMaintenance}
            className={`px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all border-2 ${
              maintenanceEnabled 
              ? 'bg-red-600 text-white border-red-700 animate-pulse' 
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
            }`}
          >
            {maintenanceEnabled ? 'MAINTENANCE ACTIVE (LOCKOUT)' : 'ENABLE MAINTENANCE MODE'}
          </button>
          
          {actionMsg && (
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${actionMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {actionMsg.text}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* SYSTEM HEALTH RADAR TAB */}
          {activeTab === 'health' && systemHealth && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-emerald-500" />
                Live Node.js Diagnostics & Hardware Radar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Memory Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Host Machine RAM</h3>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {systemHealth.memory.systemUsedPercent.toFixed(1)}<span className="text-xl text-slate-500">%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${systemHealth.memory.systemUsedPercent}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-mono mb-2">
                    <span>Host Used: {(systemHealth.memory.systemUsed / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                    <span>Host Total: {(systemHealth.memory.systemTotal / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    <span>Node.js API Usage:</span>
                    <span>{(systemHealth.memory.processRss / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>

                {/* CPU Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-emerald-500 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">CPU Core Load (vCPUs)</h3>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {systemHealth.cpu.estimatedUsagePercent.toFixed(1)}<span className="text-xl text-slate-500">%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                    <div className={`h-2 rounded-full ${systemHealth.cpu.estimatedUsagePercent > 80 ? 'bg-red-500' : systemHealth.cpu.estimatedUsagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${systemHealth.cpu.estimatedUsagePercent}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Cores: {systemHealth.cpu.cores}</span>
                    <span>Avg Load: {systemHealth.cpu.loadAvg[0].toFixed(2)}</span>
                  </div>
                </div>

                {/* System Specs */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Host OS & V8 Engine</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Platform</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-white font-bold">{systemHealth.os.platform} ({systemHealth.os.release})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Host Uptime</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-white font-bold">{(systemHealth.os.uptime / 3600).toFixed(1)} Hours</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                      <span className="text-sm text-slate-500">API Node Uptime</span>
                      <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-bold">{(systemHealth.process.uptime / 3600).toFixed(2)} Hours</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                      <span className="text-sm text-slate-500">V8 Heap Alloc/Limit</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-white font-bold">{(systemHealth.memory.heapTotal / 1024 / 1024).toFixed(0)} MB / {(systemHealth.memory.heapLimit / 1024 / 1024).toFixed(0)} MB</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Prisma DB Pool */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-blue-500 font-bold">
                    <Database className="w-3 h-3 animate-pulse" /> LIVE
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">PostgreSQL DB Pool (Prisma)</h3>
                  
                  {systemHealth.database ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Total Open Connections</span>
                        <span className="text-lg font-mono text-slate-900 dark:text-white font-bold">{systemHealth.database.totalConnections}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden flex">
                        <div className="bg-blue-500 h-2" style={{ width: `${(systemHealth.database.activeConnections / Math.max(systemHealth.database.totalConnections, 1)) * 100}%` }}></div>
                        <div className="bg-slate-300 dark:bg-slate-700 h-2 flex-1"></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-mono border-b border-slate-200 dark:border-slate-800 pb-3">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Active: {systemHealth.database.activeConnections}</span>
                        <span>Idle: {systemHealth.database.idleConnections}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm text-slate-500">Query Wait Time</span>
                        <span className="text-sm font-mono text-amber-600 dark:text-amber-500 font-bold">{systemHealth.database.queryWaitTime.toFixed(2)} ms</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 py-4">Database Metrics Offline.</div>
                  )}
                </div>

                {/* Network & TCP Connections */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-900/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-purple-500 font-bold">
                    <Activity className="w-3 h-3 animate-pulse" /> LIVE
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Network & TCP Stream Matrix</h3>
                  
                  <div className="grid grid-cols-2 gap-4 h-full pb-4">
                    <div className="flex flex-col justify-center border-r border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500 mb-1">Active TCP Sockets</span>
                      <span className="text-3xl font-bold font-mono text-purple-600 dark:text-purple-400">
                        {systemHealth.process.activeHandles}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center pl-2">
                      <span className="text-xs text-slate-500 mb-1">Pending Async Req</span>
                      <span className="text-3xl font-bold font-mono text-amber-500">
                        {systemHealth.process.activeRequests}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE NOW TAB */}
          {activeTab === 'live' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Active Telemetry Streams ({liveNow.length})
                </h2>
                <div className="relative max-w-sm w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={liveSearchQuery}
                    onChange={(e) => setLiveSearchQuery(e.target.value)}
                    placeholder="Filter by Name, Email, IP or Page..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              {liveNow.filter(u => {
                const search = liveSearchQuery.toLowerCase();
                const name = `${u.employee?.firstName || ''} ${u.employee?.lastName || ''}`.toLowerCase();
                const email = (u.employee?.officialEmail || '').toLowerCase();
                const ip = (u.internetIp || u.ipAddress || '').toLowerCase();
                const page = (u.page || '').toLowerCase();
                return name.includes(search) || email.includes(search) || ip.includes(search) || page.includes(search);
              }).length === 0 ? (
                <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                  <Monitor className="w-12 h-12 mb-4 text-slate-300" />
                  <p>No telemetry streams match your filters or no employees are active.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {liveNow.filter(u => {
                    const search = liveSearchQuery.toLowerCase();
                    const name = `${u.employee?.firstName || ''} ${u.employee?.lastName || ''}`.toLowerCase();
                    const email = (u.employee?.officialEmail || '').toLowerCase();
                    const ip = (u.internetIp || u.ipAddress || '').toLowerCase();
                    const page = (u.page || '').toLowerCase();
                    return name.includes(search) || email.includes(search) || ip.includes(search) || page.includes(search);
                  }).map((u, i) => {
                      const isIdle = u.idleTimeMs > 180000;
                      const isUnfocused = u.isTabFocused === false;
                      let statusColor = 'bg-green-500';
                      let shadowColor = 'rgba(34,197,94,0.6)';
                      let statusText = 'Active & Focused';
                      
                      if (isIdle) {
                        statusColor = 'bg-red-500';
                        shadowColor = 'rgba(239,68,68,0.6)';
                        statusText = `AFK (${Math.floor(u.idleTimeMs / 60000)}m)`;
                      } else if (isUnfocused) {
                        statusColor = 'bg-yellow-500';
                        shadowColor = 'rgba(234,179,8,0.6)';
                        statusText = 'Tab Unfocused';
                      }

                      return (
                      <div key={i} className="flex flex-col lg:flex-row border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow relative">
                        {/* Status Strip */}
                        <div className={`w-full lg:w-1.5 h-1.5 lg:h-auto absolute top-0 left-0 lg:relative flex-shrink-0 ${statusColor}`}></div>
                        
                        <div className="p-5 flex-1 flex flex-col gap-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-800">
                                  {u.employee?.firstName?.[0] || '?'}{u.employee?.lastName?.[0] || '?'}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${statusColor} rounded-full border-2 border-white dark:border-slate-950 animate-pulse shadow-[0_0_8px_${shadowColor}]`} title={statusText}></div>
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                                  {u.employee?.firstName} {u.employee?.lastName}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{u.employee?.officialEmail || u.userId}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                                {u.employee?.designation?.title || 'Unknown Role'}
                              </span>
                            </div>
                          </div>

                          {/* Telemetry Grid */}
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            {/* Network Box */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Database className="w-3 h-3" /> External IP / Network
                              </div>
                              <div className="font-mono text-sm text-slate-900 dark:text-red-400 break-all leading-tight">
                                {u.internetIp || 'Detecting...'}
                              </div>
                              {u.ipAddress && u.ipAddress !== u.internetIp && (
                                <div className="text-xs font-mono text-slate-500 mt-1">Int: {u.ipAddress}</div>
                              )}
                            </div>

                            {/* Device Box */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Monitor className="w-3 h-3" /> System Environment
                              </div>
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                {u.deviceData?.hardwareStr || `${u.deviceData?.browser || 'Unknown'} on ${u.deviceData?.os || 'Unknown OS'}`}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {u.deviceData?.hardwareStr ? 'Deep Fingerprint Active' : (u.deviceData?.deviceType === 'mobile' ? 'Mobile Device' : 'Desktop/Laptop')}
                              </div>
                            </div>

                            {/* Current Page */}
                            <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                  <SquareTerminal className="w-3 h-3" /> Current Module Context
                                </div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                  {u.page || '/'}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Ping: &lt;200ms
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TRACER TAB */}
          {activeTab === 'tracer' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Dynamic IP Firewall */}
                <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm flex-1">
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-500 flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5" /> Threat Neutralization Firewall
                  </h3>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                    Instantly block any IP address across the entire enterprise cluster. Packets will be dropped at the gateway.
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={bannedIpInput}
                      onChange={(e) => setBannedIpInput(e.target.value)}
                      placeholder="Enter IPv4 Address (e.g. 192.168.1.5)"
                      className="flex-1 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                    />
                    <button
                      onClick={handleIpBan}
                      disabled={isBanningIp}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
                    >
                      <X className="w-4 h-4" /> Ban IP
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5" /> The "God Eye" Matrix
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    This terminal streams raw, unfiltered HTTP packets directly from the Node.js API Interceptor in real-time. Passwords and MFA tokens are automatically redacted for security.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LISTENING TO {networkTraces.length} PACKETS...
                  </div>
                </div>
              </div>

              {/* Terminal View */}
              <div className="bg-[#0c0c0c] border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[600px] flex flex-col">
                <div className="bg-[#1a1a1a] border-b border-slate-800 px-4 py-2 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 ml-2">master-admin@crewbase:~/network-tracer</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] md:text-xs">
                  {networkTraces.length === 0 ? (
                    <div className="text-slate-600 italic">Waiting for incoming network packets...</div>
                  ) : (
                    networkTraces.map((trace, i) => (
                      <div key={i} className="border border-slate-800 bg-[#141414] rounded-md p-3 hover:border-slate-700 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-2 border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              trace.method === 'GET' ? 'bg-blue-900/40 text-blue-400' :
                              trace.method === 'POST' ? 'bg-green-900/40 text-green-400' :
                              trace.method === 'PUT' ? 'bg-yellow-900/40 text-yellow-400' :
                              'bg-red-900/40 text-red-400'
                            }`}>
                              {trace.method}
                            </span>
                            <span className="text-slate-300 font-bold">{trace.url}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-slate-500">
                            <span className={trace.statusCode >= 400 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {trace.statusCode} HTTP
                            </span>
                            <span>{trace.latencyMs}ms</span>
                            <span>{trace.ip}</span>
                            <span>IN:{trace.requestSize}B OUT:{trace.responseSize}B</span>
                            <span>{new Date(trace.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className="text-slate-400 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(trace.payload, null, 2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="p-6 space-y-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Historical Traffic Flow (Trading View)</h2>
              <div className="h-80 bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-inner relative overflow-hidden">
                <div className="absolute top-4 left-4 text-xs font-mono text-emerald-400 font-bold tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE TRAFFIC VOLUME
                </div>
                <ResponsiveContainer width="100%" height="100%" className="mt-6">
                  <ComposedChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSpike" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(t: any) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }} 
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      labelFormatter={(t: any) => new Date(t).toLocaleString()}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" name="Traffic Volume" />
                    <Bar dataKey="uniqueUsersCount" barSize={8} fill="url(#colorSpike)" opacity={0.7} name="Active Users" />
                    <Line type="stepAfter" dataKey="volume" stroke="#6366f1" strokeWidth={1} dot={false} name="Volume Trend" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto mt-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Time</th>
                      <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Employee</th>
                      <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Page Route</th>
                      <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Environment</th>
                      <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Internal IP</th>
                      <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Public WiFi IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {history.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No history data yet.</td></tr>}
                    {history.filter((h, index, self) => index === self.findIndex((t) => t.employeeId === h.employeeId)).map((h, i) => (
                      <tr 
                        key={i} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        onClick={() => openDeepDive(h.employeeId, h.employee)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">{new Date(h.timestamp).toLocaleTimeString()}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {h.employee?.firstName} {h.employee?.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{h.employee?.officialEmail}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400 text-xs">{h.page}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {h.deviceData?.hardwareStr || h.deviceData?.browser || 'Unknown'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {h.deviceData?.hardwareStr ? 'Deep Fingerprint' : `${h.deviceData?.os || 'Unknown OS'} • ${h.deviceData?.device || 'Desktop'}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">{h.ipAddress}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-500">{h.internetIp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANOMALIES TAB */}
          {activeTab === 'anomalies' && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Anomaly Detection Radar</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {anomalies.length === 0 && (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    No anomalies detected. System secure.
                  </div>
                )}
                {anomalies.map(anomaly => (
                  <div key={anomaly.id} className="p-5 bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/50 rounded-xl shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">{anomaly.type}</h3>
                        <span className="text-xs text-slate-500">{new Date(anomaly.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Employee: <span className="font-mono">{anomaly.employeeId}</span></p>
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
                        {JSON.stringify(anomaly.details, null, 2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEEP AUDIT TAB */}
          {activeTab === 'audit' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                    <th className="px-6 py-4 font-semibold">Actor</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Module</th>
                    <th className="px-6 py-4 font-semibold">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {deepAudit.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No audit logs found.</td></tr>}
                  {deepAudit.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{log.actorEmail}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{log.module}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CREWBASE CONTROL TAB */}
          {activeTab === 'crewbase' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold text-right">Master Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-slate-500">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {emp.user?.role || 'NO_USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {emp.user && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => forceAction(`/user/${emp.user.id}/password-reset`, 'Password completely reset. User logged out.', 'Are you absolutely sure you want to FORCE RESET the password for this user?')}
                              className="px-3 py-1.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                              title="Force Password Reset"
                            >
                              <Key className="w-3 h-3" /> Reset Pass
                            </button>
                            <button 
                              onClick={() => forceAction(`/user/${emp.user.id}/mfa-reset`, 'MFA Wiped.', 'FORCE WIPE the MFA Authenticator for this user?')}
                              className="px-3 py-1.5 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                            >
                              <Smartphone className="w-3 h-3" /> Wipe MFA
                            </button>
                            <button 
                              onClick={() => forceAction(`/user/${emp.user.id}/block`, 'User Terminated.', 'TERMINATE ALL SESSIONS and lock out this user?')}
                              className="px-3 py-1.5 text-xs font-medium rounded bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-1"
                            >
                              <UserX className="w-3 h-3" /> Terminate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SECURITY ALERTS TAB */}
          {activeTab === 'security' && (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {alerts.length === 0 && <div className="p-8 text-center text-slate-500">No active security alerts.</div>}
              {alerts.map(a => (
                <div key={a.id} className="p-6 flex items-start justify-between bg-red-50/50 dark:bg-red-950/10">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 text-red-600 rounded-full mt-1">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white text-base">{a.type.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{a.description}</p>
                      <div className="flex gap-4 mt-3 text-xs text-slate-500 font-mono">
                        <span>IP: {a.ipAddress || 'Unknown'}</span>
                        <span>Time: {new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(a.id)}
                    className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-medium hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Resolve Alert
                  </button>
                </div>
              ))}
            </div>
          )}


          {/* NETWORK TRACER TAB */}
          {activeTab === 'tracer' && (
            <div className="overflow-x-auto bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Time</th>
                    <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Method</th>
                    <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Endpoint</th>
                    <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">Duration</th>
                    <th className="px-6 py-4 font-semibold uppercase text-[11px] tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {networkTraces.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No traces captured yet. Waiting for traffic...</td></tr>}
                  {networkTraces.map((trace, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{new Date(trace.timestamp).toLocaleTimeString()}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{trace.method}</td>
                      <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400 text-xs">{trace.url}</td>
                      <td className="px-6 py-4 text-xs font-mono">{trace.duration}ms</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{trace.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      )}

      {/* DEEP DIVE MODAL */}
      {selectedEmployeeForDive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedEmployeeForDive.firstName} {selectedEmployeeForDive.lastName}
                  </h2>
                  <p className="text-sm text-slate-500">{selectedEmployeeForDive.officialEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedEmployeeForDive.user && (
                  <>
                    <button 
                      onClick={() => setKillSwitchAction({ userId: selectedEmployeeForDive.user.id, action: 'HIJACK_REDIRECT', title: 'Force Redirect Browser', endpoint: `/hijack/${selectedEmployeeForDive.id}`, method: 'POST', body: { type: 'REDIRECT', url: '/master-auth' } })}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                    >
                      <SquareTerminal className="w-3 h-3" /> Redirect
                    </button>
                    <button 
                      onClick={() => setKillSwitchAction({ userId: selectedEmployeeForDive.user.id, action: 'HIJACK_LOCKOUT', title: 'Remote Screen Lockout', endpoint: `/hijack/${selectedEmployeeForDive.id}`, method: 'POST', body: { type: 'LOCKOUT' } })}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                    >
                      <Lock className="w-3 h-3" /> Screen Lock
                    </button>
                    <button 
                      onClick={() => setKillSwitchAction({ userId: selectedEmployeeForDive.user.id, action: 'WIPE_MFA', title: 'Wipe MFA Config', endpoint: `/user/${selectedEmployeeForDive.user.id}/mfa-reset`, method: 'PUT' })}
                      className="px-3 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                    >
                      <Smartphone className="w-3 h-3" /> Wipe MFA
                    </button>
                    <button 
                      onClick={() => setKillSwitchAction({ userId: selectedEmployeeForDive.user.id, action: 'SUSPEND', title: 'Force Suspend (Terminate Sessions)', endpoint: `/user/${selectedEmployeeForDive.user.id}/block`, method: 'PUT' })}
                      className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3" /> Suspend
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedEmployeeForDive(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-700 ml-2"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" /> Complete Action Timeline
              </h3>
              
              {diveLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                  {diveTimeline.length === 0 && (
                    <div className="text-center text-slate-500 py-8">No historical actions found for this employee.</div>
                  )}
                  {diveTimeline.map((item: any, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        {item.action === 'VIEW' ? <Monitor className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-slate-900 dark:text-white">{item.action}</div>
                          <time className="font-mono text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</time>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded text-xs">{item.page}</span>
                        </div>
                        
                        {(item.ipAddress || item.internetIp) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center gap-4 text-xs font-mono text-slate-500">
                            {item.ipAddress && <span>INT: {item.ipAddress}</span>}
                            {item.internetIp && <span>EXT: {item.internetIp}</span>}
                          </div>
                        )}
                        {item.deviceData && (
                           <div className="mt-2 text-xs text-slate-500">
                             {item.deviceData.browser} on {item.deviceData.os} ({item.deviceData.device})
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* KILL SWITCH CONFIRM MODAL */}
      {killSwitchAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border-2 border-red-500 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 dark:bg-red-950/30 p-6 border-b border-red-100 dark:border-red-900/50 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-500 mb-2">Master Override Authorization</h2>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                You are about to execute: <strong className="text-slate-900 dark:text-white">{killSwitchAction.title}</strong>
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Master Admin Password
                </label>
                <input 
                  type="password" 
                  value={killSwitchPassword}
                  onChange={e => setKillSwitchPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Enter password to execute..."
                  autoFocus
                />
              </div>
              
              <div className="flex items-center gap-3 mt-6">
                <button 
                  onClick={() => { setKillSwitchAction(null); setKillSwitchPassword(''); }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  ABORT
                </button>
                <button 
                  onClick={executeKillAction}
                  disabled={executingKill}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2"
                >
                  {executingKill ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>EXECUTE <AlertTriangle className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ObservatoryPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading Observatory...</div>}>
      <ObservatoryContent />
    </Suspense>
  );
}
