'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import { RiskItem } from '@/types';
import { 
  getRiskTypeDisplayName, 
  getRiskSourceDisplayName 
} from '@/lib/api/riskManagement';

interface RiskListViewProps {
  risks: RiskItem[];
  onViewRisk: (riskId: string) => void;
  onEditRisk: (risk: RiskItem) => void;
  onArchiveRisk: (riskId: string) => void;
  userRole: string;
  canEdit: boolean;
}

const RiskListView: React.FC<RiskListViewProps> = ({
  risks,
  onViewRisk,
  onEditRisk,
  onArchiveRisk,
  userRole,
  canEdit
}) => {
  // Get risk score icon
  const getRiskScoreIcon = (score: string) => {
    switch (score) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-sand-500" />;
      case 'medium':
        return <Minus className="h-4 w-4 text-ochre-500" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-grass-500" />;
      default:
        return <Minus className="h-4 w-4 text-sky-500" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-sand-500" />;
      case 'monitoring':
        return <Eye className="h-4 w-4 text-ochre-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-grass-500" />;
      case 'transferred':
        return <XCircle className="h-4 w-4 text-sky-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-sky-500" />;
    }
  };

  // Custom risk score colors
  const getCustomRiskScoreColor = (score: string): string => {
    switch (score) {
      case 'high':
        return 'text-sand-900 bg-sand-100 border-sand-300';
      case 'medium':
        return 'text-ochre-900 bg-ochre-100 border-ochre-300';
      case 'low':
        return 'text-grass-900 bg-grass-100 border-grass-300';
      default:
        return 'text-sky-900 bg-sky-100 border-sky-300';
    }
  };

  // Get risk source color
  const getRiskSourceColor = (source: string): string => {
    switch (source) {
      case 'manual':
        return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'project_setup':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'site_setup':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'stakeholder_mapping':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'toc_stage1':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'toc_stage2':
        return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      default:
        return 'text-sky-600 bg-sky-50 border-sky-200';
    }
  };

  return (
    <Card className="border-sky-200 bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-sky-100 bg-sky-50">
                <TableHead className="text-stratosphere font-semibold">Risk Name</TableHead>
                <TableHead className="text-stratosphere font-semibold">Source</TableHead>
                <TableHead className="text-stratosphere font-semibold">Type</TableHead>
                <TableHead className="text-stratosphere font-semibold">Score</TableHead>
                <TableHead className="text-stratosphere font-semibold">Status</TableHead>
                <TableHead className="text-stratosphere font-semibold">Owner</TableHead>
                <TableHead className="text-stratosphere font-semibold">Review Date</TableHead>
                <TableHead className="text-stratosphere font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk) => (
                <TableRow 
                  key={risk._id} 
                  className="border-sky-50 hover:bg-sky-50 transition-colors"
                >
                  {/* Risk Name & Description */}
                  <TableCell className="max-w-xs">
                    <div>
                      <p className="font-medium text-stratosphere truncate">
                        {risk.name}
                      </p>
                      <p className="text-sm text-sky-500 truncate">
                        {risk.riskDescription}
                      </p>
                    </div>
                  </TableCell>

                  {/* Risk Source */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant="outline" 
                        className={`${getRiskSourceColor(risk.riskSource)} text-xs flex items-center gap-1 w-fit`}
                      >
                        <MapPin className="h-3 w-3" />
                        {getRiskSourceDisplayName(risk.riskSource)}
                      </Badge>
                      {risk.sourceReference && (
                        <p className="text-xs text-sky-400 truncate max-w-[150px]" title={risk.sourceReference}>
                          {risk.sourceReference}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Risk Type */}
                  <TableCell>
                    <Badge variant="outline" className="text-sky-500 border-sky-200 text-xs">
                      {getRiskTypeDisplayName(risk.riskType)}
                    </Badge>
                  </TableCell>

                  {/* Risk Score */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRiskScoreIcon(risk.riskScore)}
                      <Badge className={`${getCustomRiskScoreColor(risk.riskScore)} border font-medium`}>
                        {risk.riskScore.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(risk.status)}
                      <span className="text-sm text-stratosphere capitalize">
                        {risk.status}
                      </span>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-sky-500 flex-shrink-0" />
                      <span className="text-sm text-stratosphere truncate max-w-[120px]" title={risk.owner.name}>
                        {risk.owner.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Review Date */}
                  <TableCell>
                    {risk.reviewDate ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-sky-500 flex-shrink-0" />
                          <span className="text-sm text-stratosphere">
                            {new Date(risk.reviewDate).toLocaleDateString()}
                          </span>
                        </div>
                        {risk.isReviewOverdue && (
                          <Badge className="text-xs bg-sand-100 text-sand-900 border-sand-300 w-fit">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-sky-400">Not set</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-sky-100"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-sky-200">
                        <DropdownMenuLabel className="text-stratosphere">Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => onViewRisk(risk._id)}
                          className="text-stratosphere hover:bg-sky-50 cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => onEditRisk(risk)}
                              className="text-stratosphere hover:bg-sky-50 cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Risk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-sky-100" />
                            <DropdownMenuItem 
                              onClick={() => onArchiveRisk(risk._id)}
                              className="text-sand-500 hover:bg-sand-50 cursor-pointer"
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

              {/* Empty State */}
              {risks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="h-12 w-12 text-sky-300" />
                      <p className="text-stratosphere font-medium">No risks found</p>
                      <p className="text-sky-500 text-sm">
                        Try adjusting your filters or create a new risk
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskListView;