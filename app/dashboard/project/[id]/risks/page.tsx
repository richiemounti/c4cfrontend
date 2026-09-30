// app/dashboard/project/[id]/risk-management/page.tsx
// COMPLETE UPDATED FILE WITH TWO-VIEW SYSTEM

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Plus,
  Clock,
  TrendingUp,
  List,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import components and APIs
import ProjectSidebar from '@/components/project/ProjectSidebar';
import { Topbar, TopbarBack, TopbarHead, TopbarTitle, TopbarSub, TopbarActions } from '@/components/shared/Topbar';
import { StatGrid, StatTile } from '@/components/shared/StatTile';
import { Toolbar, SearchField, FilterRow, SegmentedToggle, SegmentedButton } from '@/components/shared/Toolbar';
import { RowHead } from '@/components/shared/PageLayout';
import { getProject, getProjectSites } from '@/lib/api/project';
import { getUserRoles } from '@/lib/api/user';
import { getOrganization } from '@/lib/api/organization';
import {
  getRiskRegisterSummary,
  getRiskDetails,
  archiveRisk,
  getOrganizationUsers
} from '@/lib/api/riskManagement';

// ✅ FIXED: Import types from @/types
import { 
  RiskItem, 
  Project, 
  ProjectSite, 
  Organization, 
  Role,
  RiskRegisterSummary as RiskSummaryType 
} from '@/types';

import CreateRiskModal from '@/components/project/modals/CreateRiskModal';
import EditRiskModal from '@/components/project/modals/EditRiskModal';
import RiskListView from '@/components/project/risk/RiskListView';
import RiskReportView from '@/components/project/risk/RiskReportView';
import { useAuth } from '@/contexts/AuthContext';

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default function RiskManagementPage({ params }: PageProps) {
  const projectId = params.id;
  const { user } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<Project | null>(null);
  const [projectSites, setProjectSites] = useState<ProjectSite[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isConnectGoStaff, setIsConnectGoStaff] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const userRole = user?.primaryRole || 'reviewer';
  
  // Risk data state
  const [riskSummary, setRiskSummary] = useState<RiskSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: View mode state
  const [viewMode, setViewMode] = useState<'list' | 'report'>('list');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRiskScore, setFilterRiskScore] = useState('');
  const [filterRiskSource, setFilterRiskSource] = useState(''); // NEW
  const [filterOwner, setFilterOwner] = useState(''); // NEW: Replaces filterRiskType
  const [filterReviewDateFrom, setFilterReviewDateFrom] = useState('');
  const [filterReviewDateTo, setFilterReviewDateTo] = useState('');
  
  // Modal state
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
  
  // NEW: Organization users for owner filter
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([]);

  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      setProjectLoading(true);
      const response = await getProject(projectId);
      setProject(response.data);
      
      const organizationId = response.data.organization as unknown as string;
      
      if (organizationId) {
        try {
          const orgResponse = await getOrganization(organizationId);
          setOrganization(orgResponse.data);
          
          // NEW: Fetch organization users for owner filter
          const usersResponse = await getOrganizationUsers(organizationId);
          // Filter out ConnectGo staff - only show organization members
          const orgUsers = usersResponse.filter((u: any) => !u.isConnectGoStaff);
          setOrganizationUsers(orgUsers);
        } catch (orgError) {
          console.error('Failed to fetch organization:', orgError);
        }
      }
      
      const sitesResponse = await getProjectSites(projectId);
      setProjectSites(sitesResponse.data || []);
      
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    } finally {
      setProjectLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    if (!user?._id) return;
    
    try {
      const rolesResponse = await getUserRoles(user._id);
      setUserRoles(rolesResponse.data.roles);
      setIsConnectGoStaff(rolesResponse.data.isConnectGoStaff);
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
    }
  };

  // Fetch risk data with NEW filters
  const fetchRiskData = async () => {
    try {
      console.log('Fetching risk data for project:', projectId);
      setLoading(true);
      const filters = {
        projectId,
        ...(filterStatus && filterStatus !== 'all' && { status: filterStatus }),
        ...(filterRiskScore && filterRiskScore !== 'all' && { riskScore: filterRiskScore }),
        ...(filterRiskSource && filterRiskSource !== 'all' && { riskSource: filterRiskSource }), // NEW
        ...(filterOwner && filterOwner !== 'all' && { owner: filterOwner }), // NEW
        ...(filterReviewDateFrom && { reviewDateFrom: filterReviewDateFrom }),
        ...(filterReviewDateTo && { reviewDateTo: filterReviewDateTo })
      };
      console.log('Risk filters:', filters);
      const data = await getRiskRegisterSummary(filters);
      console.log('Risk data received:', data);
      setRiskSummary(data);
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  useEffect(() => {
    if (user?._id) {
      fetchUserRoles();
    }
  }, [user]);

  // UPDATED: Include new filters
  useEffect(() => {
    if (projectId) {
      fetchRiskData();
    }
  }, [
    projectId, 
    filterStatus, 
    filterRiskScore, 
    filterRiskSource, // NEW
    filterOwner,      // NEW
    filterReviewDateFrom, 
    filterReviewDateTo
  ]);

  // Filter risks based on search term
  const filteredRisks = riskSummary?.risks.filter(risk =>
    risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.riskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risk.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleViewRisk = async (riskId: string) => {
    try {
      const riskDetails = await getRiskDetails(riskId);
      setSelectedRisk(riskDetails);
      // You can open a detail modal here if needed
    } catch (error) {
      console.error('Failed to fetch risk details:', error);
    }
  };

  const handleArchiveRisk = async (riskId: string) => {
    if (confirm('Are you sure you want to archive this risk?')) {
      try {
        await archiveRisk(riskId);
        fetchRiskData();
      } catch (error) {
        console.error('Failed to archive risk:', error);
      }
    }
  };

  const handleEditRisk = (risk: RiskItem) => {
    setEditingRisk(risk);
    setShowEditDialog(true);
  };

  const canCreateRisks = isConnectGoStaff || 
    ['manager', 'projectCreator'].includes(user?.primaryRole || '');

  if (projectLoading) {
    return (
      <div className="flex min-h-screen bg-c4c-grey-bg">
        <div className="animate-pulse bg-c4c-grey-bg border-r border-c4c-rule w-64 h-screen"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-c4c-coral"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-c4c-grey-bg">
      {/* Project Sidebar */}
      <ProjectSidebar
        projectId={projectId}
        projectName={project?.name || 'Loading...'}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Page Header */}
        <Topbar motif="pink">
          <TopbarBack href={`/dashboard/project/${projectId}`}>Back to Project</TopbarBack>
          <TopbarHead>
            <div>
              <TopbarTitle>Risk Register</TopbarTitle>
              <TopbarSub>{project?.name}</TopbarSub>
            </div>
            {canCreateRisks && (
              <TopbarActions>
                <Button variant="spotlight" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4" />
                  Add New Risk
                </Button>
              </TopbarActions>
            )}
          </TopbarHead>
        </Topbar>

        <div className="p-6 flex flex-col gap-6">
          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-c4c-coral"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards — gold only when the number is above zero; at
                  zero the tile is plain white (a queue of zero isn't waiting
                  on anyone). */}
              {riskSummary && (
                <StatGrid>
                  <StatTile label="Total Risks" value={riskSummary.stats.total} caption="Logged on this project" icon={<AlertTriangle />} />
                  <StatTile
                    label="High Risk"
                    value={riskSummary.stats.byScore.high}
                    caption="Scored 15 or above"
                    icon={<TrendingUp />}
                    variant={riskSummary.stats.byScore.high > 0 ? 'attention' : 'default'}
                  />
                  <StatTile
                    label="Open Risks"
                    value={riskSummary.stats.byStatus.open}
                    caption="Not yet mitigated"
                    icon={<AlertTriangle />}
                    variant={riskSummary.stats.byStatus.open > 0 ? 'attention' : 'default'}
                  />
                  <StatTile
                    label="Overdue Reviews"
                    value={riskSummary.stats.reviewOverdue}
                    caption="Past their review date"
                    icon={<Clock />}
                    variant={riskSummary.stats.reviewOverdue > 0 ? 'attention' : 'default'}
                  />
                </StatGrid>
              )}

              {/* Filters and View Toggle */}
              <Card className="p-6">
                <RowHead>
                  <h3 className="text-lg font-medium text-black">Risk Register</h3>
                  <SegmentedToggle>
                    <SegmentedButton active={viewMode === 'list'} icon={<List className="h-4 w-4" />} onClick={() => setViewMode('list')}>
                      List View
                    </SegmentedButton>
                    <SegmentedButton active={viewMode === 'report'} icon={<BarChart3 className="h-4 w-4" />} onClick={() => setViewMode('report')}>
                      Report View
                    </SegmentedButton>
                  </SegmentedToggle>
                </RowHead>

                <Toolbar className="mt-4">
                  <SearchField
                    placeholder="Search risks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Toolbar>

                {/* Filters Row (only show in list view) */}
                {viewMode === 'list' && (
                  <FilterRow>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterRiskScore} onValueChange={setFilterRiskScore}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Risk Score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scores</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* NEW: Risk Source Filter */}
                    <Select value={filterRiskSource} onValueChange={setFilterRiskSource}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Risk Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="project_setup">Project Setup</SelectItem>
                        <SelectItem value="site_setup">Site Setup</SelectItem>
                        <SelectItem value="stakeholder_mapping">Stakeholder Mapping</SelectItem>
                        <SelectItem value="toc_stage1">ToC Stage 1</SelectItem>
                        <SelectItem value="toc_stage2">ToC Stage 2</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* NEW: Owner Filter (replaces risk type) */}
                    <Select value={filterOwner} onValueChange={setFilterOwner}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Owners</SelectItem>
                        {organizationUsers.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Date Range Filters */}
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={filterReviewDateFrom}
                        onChange={(e) => setFilterReviewDateFrom(e.target.value)}
                        placeholder="Review from"
                        className="w-[150px]"
                      />
                      <Input
                        type="date"
                        value={filterReviewDateTo}
                        onChange={(e) => setFilterReviewDateTo(e.target.value)}
                        placeholder="Review to"
                        className="w-[150px]"
                      />
                    </div>
                  </FilterRow>
                )}
              </Card>

            {/* Conditional View Rendering */}
            {viewMode === 'list' ? (
              <RiskListView
                risks={filteredRisks}
                onViewRisk={handleViewRisk}
                onEditRisk={handleEditRisk}
                onArchiveRisk={handleArchiveRisk}
                userRole={userRole}
                canEdit={['owner', 'admin', 'accountManager', 'manager', 'projectCreator'].includes(userRole)}
              />
            ) : (
              <RiskReportView
                risks={filteredRisks}
                stats={riskSummary?.stats}
                projectId={projectId}
                projectName={project?.name || ''}
                appliedFilters={{
                  status: filterStatus,
                  riskScore: filterRiskScore,
                  riskSource: filterRiskSource,
                  owner: filterOwner,
                  reviewDateFrom: filterReviewDateFrom,
                  reviewDateTo: filterReviewDateTo
                }}
              />
            )}
          </>
          )}
        </div>

        {/* Create Risk Modal */}
        <CreateRiskModal
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          projectId={projectId}
          organizationId={(project?.organization as unknown as string) || ''}
          userRole={user?.primaryRole as 'manager' | 'projectCreator' | 'organiser' | 'reviewer' || 'reviewer'}
          onRiskCreated={fetchRiskData}
          projectSites={projectSites}
          currentUser={user ? { _id: user._id, name: user.name, email: user.email } : undefined}
        />

        {/* Edit Risk Modal */}
        <EditRiskModal
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          risk={editingRisk}
          userRole={userRole as 'manager' | 'projectCreator' | 'organiser' | 'reviewer'}
          onRiskUpdated={fetchRiskData}
          projectSites={projectSites}
          currentUser={user ? { _id: user._id, name: user.name, email: user.email } : undefined}
        />
      </div>
    </div>
  );
}