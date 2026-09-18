'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FolderOpen,
  MapPin,
  ChevronRight,
  AlertCircle,
  Activity,
  Filter,
  Search,
  BarChart2,
  User,
} from 'lucide-react';
import { getWorkloadSummary } from '@/lib/api/workload';
import { WorkloadSummary, WorkloadItem } from '@/types/adminDashboard';
import { useAuth } from '@/contexts/AuthContext';

// Extended type to include accountManagers returned by the backend
interface AccountManagerStat {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  escalatedCount: number;
  capacityTier: 'green' | 'orange' | 'red';
  capacityPercentage: number;
}

interface ExtendedWorkloadSummary extends WorkloadSummary {
  accountManagers?: AccountManagerStat[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

const tierConfig = {
  green: {
    label: 'Optimal',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  orange: {
    label: 'Near Capacity',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
  },
  red: {
    label: 'Over Capacity',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    bar: 'bg-red-500',
    dot: 'bg-red-500',
    text: 'text-red-700',
  },
};

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: 'Onboarding', color: 'text-gold-800',   bg: 'bg-gold-100'   },
  design:     { label: 'Design',     color: 'text-petrol-700', bg: 'bg-petrol-100' },
  measure:    { label: 'Measure',    color: 'text-emerald-700',bg: 'bg-emerald-100'},
  learn:      { label: 'Learn',      color: 'text-burgundy-700', bg: 'bg-burgundy-100' },
  tell:       { label: 'Tell',       color: 'text-cobalt-700', bg: 'bg-cobalt-100' },
};

function CapacityBar({ percentage, tier }: { percentage: number; tier: 'green' | 'orange' | 'red' }) {
  const cfg = tierConfig[tier];
  return (
    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

function AMInitials({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow"
      />
    );
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-semibold text-sm ring-2 ring-white shadow">
      {initials}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

const WorkloadDetailPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [workload, setWorkload] = useState<ExtendedWorkloadSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/account/login');
    else if (user && !user.isConnectGoStaff) router.push('/dashboard');
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // The backend returns the extended payload; cast through unknown
        const data = (await getWorkloadSummary()) as unknown as ExtendedWorkloadSummary;
        setWorkload(data);
      } catch (err) {
        console.error('Failed to load workload data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshTrigger]);

  // Derived values
  const accountManagers: AccountManagerStat[] = workload?.accountManagers ?? [];

  const filteredItems = (workload?.items ?? []).filter((item: WorkloadItem) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || item.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const overallTier: 'green' | 'orange' | 'red' = workload?.capacityStatus ?? 'green';

  // ── loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full" />
          <p className="text-sm text-neutral-500">Loading workload data…</p>
        </div>
      </div>
    );
  }

  // ── empty / error state ────────────────────────────────────────────────────
  if (!workload) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-neutral-700 font-medium">Failed to load workload data</p>
          <button
            onClick={() => setRefreshTrigger((p) => p + 1)}
            className="px-4 py-2 bg-coral-500 text-white rounded-lg text-sm hover:bg-coral-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-neutral-500 hover:text-ink-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-ink">Workload Management</h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                Account manager capacity and active project assignments
              </p>
            </div>
          </div>
          <button
            onClick={() => setRefreshTrigger((p) => p + 1)}
            className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-neutral-500"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Active Projects',
              value: workload.activeProjects,
              icon: FolderOpen,
              color: 'text-coral-600',
              bg: 'bg-coral-50',
            },
            {
              label: 'Active Sites',
              value: workload.activeSites,
              icon: MapPin,
              color: 'text-cobalt-600',
              bg: 'bg-cobalt-50',
            },
            {
              label: 'Completed',
              value: workload.completedItems,
              icon: CheckCircle2,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Total Workload',
              value: workload.totalItems,
              icon: BarChart2,
              color: 'text-neutral-700',
              bg: 'bg-stone-100',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-stone-100 p-4">
              <div className="flex items-center gap-3">
                <div className={`${bg} p-2.5 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-medium">{label}</p>
                  <p className="text-xl font-bold text-ink">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Stage Breakdown ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-700">Projects by Stage</h2>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(workload.itemsByStage).map(([stage, count]) => {
              const cfg = stageConfig[stage] ?? { label: stage, color: 'text-neutral-600', bg: 'bg-stone-100' };
              const total = workload.activeProjects || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stage} className="text-center">
                  <div className={`${cfg.bg} rounded-lg p-3 mb-2`}>
                    <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                  </div>
                  <p className="text-xs text-neutral-500 capitalize font-medium">{cfg.label}</p>
                  <p className="text-xs text-neutral-400">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* ── Account Manager Capacity ───────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-semibold text-neutral-700">Account Managers</h2>
                </div>
                {/* overall tier badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierConfig[overallTier].badge}`}>
                  {tierConfig[overallTier].label}
                </span>
              </div>

              {/* capacity key */}
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center gap-4">
                {(['green', 'orange', 'red'] as const).map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${tierConfig[t].dot}`} />
                    <span className="text-xs text-neutral-500">
                      {t === 'green' ? '0–5' : t === 'orange' ? '6–7' : '8+'}
                    </span>
                  </div>
                ))}
                <span className="text-xs text-neutral-400 ml-auto">escalated reviews</span>
              </div>

              <div className="divide-y divide-stone-50">
                {accountManagers.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <User className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">No account managers found</p>
                  </div>
                ) : (
                  accountManagers.map((am) => {
                    const cfg = tierConfig[am.capacityTier];
                    return (
                      <div key={am._id} className={`px-5 py-4 ${cfg.bg} transition-colors`}>
                        <div className="flex items-center gap-3 mb-3">
                          <AMInitials name={am.name} photo={am.photo} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{am.name}</p>
                            <p className="text-xs text-neutral-500 truncate">{am.email}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${cfg.text}`}>{am.escalatedCount}</p>
                            <p className="text-xs text-neutral-400">reviews</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                            <span className="text-xs text-neutral-500">{am.capacityPercentage}%</span>
                          </div>
                          <CapacityBar percentage={am.capacityPercentage} tier={am.capacityTier} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* optimum capacity note */}
              <div className="px-5 py-3 bg-stone-50 border-t border-stone-100">
                <p className="text-xs text-neutral-400 text-center">
                  Optimum capacity: <strong className="text-neutral-600">5 escalated reviews</strong> per manager
                </p>
              </div>
            </div>
          </div>

          {/* ── Active Projects List ──────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden h-full flex flex-col">
              <div className="px-5 py-4 border-b border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-neutral-400" />
                    <h2 className="text-sm font-semibold text-neutral-700">Active Projects</h2>
                    <span className="text-xs bg-stone-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                      {filteredItems.length}
                    </span>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search projects or organisations…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-coral-500 bg-white"
                  >
                    <option value="all">All Stages</option>
                    {Object.entries(stageConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-stone-50 max-h-[520px]">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FolderOpen className="h-10 w-10 text-stone-300 mb-3" />
                    <p className="text-sm text-neutral-400 font-medium">No projects match your filters</p>
                    <button
                      onClick={() => { setSearchQuery(''); setStageFilter('all'); }}
                      className="mt-2 text-xs text-coral-600 hover:text-coral-800"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filteredItems.map((item: WorkloadItem) => {
                    const stageCfg = stageConfig[item.stage] ?? {
                      label: item.stage,
                      color: 'text-neutral-600',
                      bg: 'bg-stone-100',
                    };
                    return (
                      <div
                        key={item._id}
                        className="px-5 py-3.5 hover:bg-stone-50 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/admin/dashboard/project/${item._id}/detail`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`${stageCfg.bg} p-2 rounded-lg flex-shrink-0`}>
                              <FolderOpen className={`h-4 w-4 ${stageCfg.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-neutral-500 truncate">
                                {item.organization?.name ?? '—'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageCfg.bg} ${stageCfg.color}`}
                            >
                              {stageCfg.label}
                            </span>
                            {item.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-stone-300" />
                            )}
                            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-neutral-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Capacity Legend & Guidelines ─────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-700">Capacity Guidelines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                {
                  tier: 'green' as const,
                  range: '0 – 5 reviews',
                  title: 'Optimal',
                  description:
                    'Account manager is handling a healthy workload and can take on additional escalations.',
                },
                {
                  tier: 'orange' as const,
                  range: '6 – 7 reviews',
                  title: 'Near Capacity',
                  description:
                    'Manager is approaching their limit. New escalations should be routed to others where possible.',
                },
                {
                  tier: 'red' as const,
                  range: '8+ reviews',
                  title: 'Over Capacity',
                  description:
                    'Manager is overloaded. Escalations are still routed here only when no better option exists.',
                },
              ] as const
            ).map(({ tier, range, title, description }) => {
              const cfg = tierConfig[tier];
              return (
                <div
                  key={tier}
                  className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                    <span className={`text-sm font-bold ${cfg.text}`}>{title}</span>
                    <span className="text-xs text-neutral-400 ml-auto">{range}</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadDetailPage;