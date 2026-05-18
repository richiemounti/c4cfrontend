// app/dashboard/project/[id]/risk-management/page.tsx
// COMPLETE UPDATED FILE WITH TWO-VIEW SYSTEM

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Clock,
  TrendingUp,
  ArrowLeft,
  List,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

// Import components and APIs
import ProjectSidebar from '@/components/project/ProjectSidebar';
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
      <div className="flex min-h-screen bg-concrete-50">
        <div className="animate-pulse bg-stratosphere w-64 h-screen"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-concrete-50">
      {/* Project Sidebar */}
      <ProjectSidebar 
        projectId={projectId} 
        projectName={project?.name || 'Loading...'} 
      />
      
      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/project/${projectId}`}>
              <Button variant="outline" className="bg-sky-500 border-sky-200 text-white hover:bg-sky-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-stratosphere">Risk Register</h1>
              <p className="text-sky-500 mt-2">{project?.name}</p>
            </div>
          </div>
          {canCreateRisks && (
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Risk
            </Button>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {riskSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-sky-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stratosphere">Total Risks</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-sky-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-stratosphere">{riskSummary.stats.total}</div>
                  </CardContent>
                </Card>

                <Card className="border-sky-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stratosphere">High Risk</CardTitle>
                    <TrendingUp className="h-4 w-4 text-sand-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sand-500">{riskSummary.stats.byScore.high}</div>
                  </CardContent>
                </Card>

                <Card className="border-sky-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stratosphere">Open Risks</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-ochre-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-ochre-500">{riskSummary.stats.byStatus.open}</div>
                  </CardContent>
                </Card>

                <Card className="border-sky-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-stratosphere">Overdue Reviews</CardTitle>
                    <Clock className="h-4 w-4 text-sand-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sand-500">{riskSummary.stats.reviewOverdue}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters and View Toggle */}
            <Card className="border-sky-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-stratosphere">Risk Register</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and View Toggle Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-sky-500" />
                      <Input
                        placeholder="Search risks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-sky-200 focus:border-sky-500"
                      />
                    </div>
                  </div>
                  
                  {/* NEW: View Mode Toggle */}
                  <div className="flex gap-2 bg-sky-50 p-1 rounded-lg border border-sky-200">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "flex items-center gap-2",
                        viewMode === 'list' 
                          ? "bg-sky-500 text-white hover:bg-sky-600" 
                          : "text-sky-600 hover:bg-sky-100"
                      )}
                    >
                      <List className="h-4 w-4" />
                      List View
                    </Button>
                    <Button
                      variant={viewMode === 'report' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('report')}
                      className={cn(
                        "flex items-center gap-2",
                        viewMode === 'report' 
                          ? "bg-sky-500 text-white hover:bg-sky-600" 
                          : "text-sky-600 hover:bg-sky-100"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Report View
                    </Button>
                  </div>
                </div>

                {/* Filters Row (only show in list view) */}
                {viewMode === 'list' && (
                  <div className="flex gap-2 flex-wrap">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[120px] border-sky-200">
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
                      <SelectTrigger className="w-[120px] border-sky-200">
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
                      <SelectTrigger className="w-[180px] border-sky-200">
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
                      <SelectTrigger className="w-[150px] border-sky-200">
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
                        className="w-[150px] border-sky-200 focus:border-sky-500"
                      />
                      <Input
                        type="date"
                        value={filterReviewDateTo}
                        onChange={(e) => setFilterReviewDateTo(e.target.value)}
                        placeholder="Review to"
                        className="w-[150px] border-sky-200 focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
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