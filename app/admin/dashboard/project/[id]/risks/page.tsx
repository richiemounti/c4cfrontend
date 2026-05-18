'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the risk management API
import {
  getRiskRegisterSummary,
  getRiskDetails,
  createRiskItem,
  updateRiskItem,
  archiveRisk,
  getRiskScoreColor,
  getRiskTypeDisplayName
} from '@/lib/api/riskManagement';

// Import types from the correct location
import { RiskItem, RiskRegisterSummary } from '@/types';

// This is the correct type for a Next.js page component
interface PageProps {
  params: {
    id: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default function RiskManagementPage({ params }: PageProps) {
  // Extract projectId from params
  const projectId = params.id;
  
  // State for project data (you'll need to fetch this)
  const [projectName, setProjectName] = useState<string>('Loading...');
  const [userRole, setUserRole] = useState<'manager' | 'projectCreator' | 'organiser' | 'reviewer'>('reviewer');
  
  const [riskSummary, setRiskSummary] = useState<RiskRegisterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRiskScore, setFilterRiskScore] = useState('');
  const [filterRiskType, setFilterRiskType] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRiskDetails, setShowRiskDetails] = useState(false);

  // Fetch project details and user role
  const fetchProjectDetails = async () => {
    try {
      // Add your API call here to fetch project name and user role
      // Example:
      // const response = await fetch(`/api/projects/${projectId}`);
      // const project = await response.json();
      // setProjectName(project.name);
      // setUserRole(project.userRole);
      
      // For now, using placeholder values
      setProjectName('Sample Project');
      setUserRole('manager');
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
  };

  // Fetch risk data
  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const filters = {
        projectId,
        ...(filterStatus && { status: filterStatus }),
        ...(filterRiskScore && { riskScore: filterRiskScore }),
        ...(filterRiskType && { riskType: filterRiskType })
      };
      const data = await getRiskRegisterSummary(filters);
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
    if (projectId) {
      fetchRiskData();
    }
  }, [projectId, filterStatus, filterRiskScore, filterRiskType]);

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
      setShowRiskDetails(true);
    } catch (error) {
      console.error('Failed to fetch risk details:', error);
    }
  };

  const handleArchiveRisk = async (riskId: string) => {
    if (confirm('Are you sure you want to archive this risk?')) {
      try {
        await archiveRisk(riskId);
        fetchRiskData(); // Refresh the data
      } catch (error) {
        console.error('Failed to archive risk:', error);
      }
    }
  };

  // Check if user can create risks
  const canCreateRisks = ['manager', 'projectCreator'].includes(userRole);

  // Get risk score icon
  const getRiskScoreIcon = (score: string) => {
    switch (score) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'monitoring':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'transferred':
        return <XCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-concrete-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stratosphere">Risk Register</h1>
          <p className="text-sky-500 mt-2">{projectName}</p>
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

      {/* Risk Summary Cards */}
      {riskSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-stratosphere-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stratosphere">Total Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stratosphere">{riskSummary.stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-stratosphere-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stratosphere">High Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{riskSummary.stats.byScore.high}</div>
            </CardContent>
          </Card>

          <Card className="border-stratosphere-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stratosphere">Open Risks</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{riskSummary.stats.byStatus.open}</div>
            </CardContent>
          </Card>

          <Card className="border-stratosphere-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stratosphere">Overdue Reviews</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{riskSummary.stats.reviewOverdue}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="border-stratosphere-100">
        <CardContent className="p-6">
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
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] border-sky-200">
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
                <SelectTrigger className="w-[140px] border-sky-200">
                  <SelectValue placeholder="Risk Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRiskType} onValueChange={setFilterRiskType}>
                <SelectTrigger className="w-[140px] border-sky-200">
                  <SelectValue placeholder="Risk Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Table */}
      <Card className="border-stratosphere-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-stratosphere-100">
                <TableHead className="text-stratosphere font-medium">Risk Name</TableHead>
                <TableHead className="text-stratosphere font-medium">Type</TableHead>
                <TableHead className="text-stratosphere font-medium">Score</TableHead>
                <TableHead className="text-stratosphere font-medium">Status</TableHead>
                <TableHead className="text-stratosphere font-medium">Owner</TableHead>
                <TableHead className="text-stratosphere font-medium">Review Date</TableHead>
                <TableHead className="text-stratosphere font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk._id} className="border-stratosphere-50 hover:bg-sky-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-stratosphere">{risk.name}</p>
                      <p className="text-sm text-sky-500 truncate max-w-xs">{risk.riskDescription}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-sky-500 border-sky-200">
                      {getRiskTypeDisplayName(risk.riskType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRiskScoreIcon(risk.riskScore)}
                      <Badge className={getRiskScoreColor(risk.riskScore)}>
                        {risk.riskScore.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(risk.status)}
                      <span className="text-sm text-stratosphere capitalize">{risk.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-sky-500" />
                      <span className="text-sm text-stratosphere">{risk.owner.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {risk.reviewDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-sky-500" />
                        <span className="text-sm text-stratosphere">
                          {new Date(risk.reviewDate).toLocaleDateString()}
                        </span>
                        {risk.isReviewOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-sky-500">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-sky-200">
                        <DropdownMenuLabel className="text-stratosphere">Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => handleViewRisk(risk._id)}
                          className="text-stratosphere hover:bg-sky-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {['manager', 'projectCreator'].includes(userRole) && (
                          <>
                            <DropdownMenuItem className="text-stratosphere hover:bg-sky-50">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Risk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleArchiveRisk(risk._id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Archive Risk
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRisks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="h-12 w-12 text-sky-300" />
                      <p className="text-stratosphere font-medium">No risks found</p>
                      <p className="text-sky-500 text-sm">
                        {searchTerm || filterStatus || filterRiskScore || filterRiskType
                          ? 'Try adjusting your filters'
                          : canCreateRisks 
                            ? 'Create your first risk to get started' 
                            : 'No risks have been created for this project yet'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Risk Details Dialog */}
      <Dialog open={showRiskDetails} onOpenChange={setShowRiskDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-sky-200">
          <DialogHeader>
            <DialogTitle className="text-stratosphere">Risk Details</DialogTitle>
          </DialogHeader>
          {selectedRisk && (
            <div className="space-y-6">
              {/* Risk Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-sky-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-stratosphere">Risk Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-sky-600">Risk Name</label>
                      <p className="text-stratosphere">{selectedRisk.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-600">Description</label>
                      <p className="text-stratosphere">{selectedRisk.riskDescription}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-600">Type</label>
                      <Badge variant="outline" className="text-sky-500 border-sky-200">
                        {getRiskTypeDisplayName(selectedRisk.riskType)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-sky-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-stratosphere">Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-sky-600">Risk Score</label>
                      <div className="flex items-center gap-2">
                        {getRiskScoreIcon(selectedRisk.riskScore)}
                        <Badge className={getRiskScoreColor(selectedRisk.riskScore)}>
                          {selectedRisk.riskScore.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-600">Probability</label>
                      <p className="text-stratosphere capitalize">{selectedRisk.probability}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-sky-600">Consequences</label>
                      <p className="text-stratosphere capitalize">{selectedRisk.consequences}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mitigation Strategy */}
              <Card className="border-sky-200">
                <CardHeader>
                  <CardTitle className="text-lg text-stratosphere">Mitigation Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stratosphere">{selectedRisk.mitigationStrategy}</p>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-sky-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-sky-500" />
                      <div>
                        <p className="text-sm font-medium text-sky-600">Owner</p>
                        <p className="text-stratosphere">{selectedRisk.owner.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-sky-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-sky-500" />
                      <div>
                        <p className="text-sm font-medium text-sky-600">Review Date</p>
                        <p className="text-stratosphere">
                          {selectedRisk.reviewDate 
                            ? new Date(selectedRisk.reviewDate).toLocaleDateString()
                            : 'Not set'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-sky-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedRisk.status)}
                      <div>
                        <p className="text-sm font-medium text-sky-600">Status</p>
                        <p className="text-stratosphere capitalize">{selectedRisk.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Risk Dialog - Placeholder */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl bg-white border-sky-200">
          <DialogHeader>
            <DialogTitle className="text-stratosphere">Create New Risk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sky-500">Create Risk form will be implemented here</p>
            <Button 
              onClick={() => setShowCreateDialog(false)}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

