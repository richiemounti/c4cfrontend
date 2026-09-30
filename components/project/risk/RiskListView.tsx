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
        return <TrendingUp className="h-4 w-4 text-c4c-burgundy" />;
      case 'medium':
        return <Minus className="h-4 w-4 text-c4c-petrol" />;
      case 'low':
        return <TrendingDown className="h-4 w-4 text-c4c-petrol" />;
      default:
        return <Minus className="h-4 w-4 text-c4c-petrol" />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-c4c-petrol" />;
      case 'monitoring':
        return <Eye className="h-4 w-4 text-c4c-petrol" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-c4c-petrol" />;
      case 'transferred':
        return <XCircle className="h-4 w-4 text-c4c-petrol" />;
      default:
        return <AlertCircle className="h-4 w-4 text-c4c-petrol" />;
    }
  };

  // Risk score severity — never coral: these badges repeat once per row,
  // and coral is reserved as the page's single spotlight action (the "Add
  // New Risk" button). Burgundy reads as real danger without breaking that
  // rule the way a repeating coral badge would.
  const getRiskScoreVariant = (score: string): 'destructive' | 'attention' | 'done' | 'quiet' => {
    switch (score) {
      case 'high': return 'destructive';
      case 'medium': return 'attention';
      case 'low': return 'done';
      default: return 'quiet';
    }
  };

  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk) => (
                <TableRow key={risk._id}>
                  {/* Risk Name & Description */}
                  <TableCell className="max-w-xs">
                    <div>
                      <p className="font-medium text-black truncate">
                        {risk.name}
                      </p>
                      <p className="text-sm text-c4c-petrol truncate">
                        {risk.riskDescription}
                      </p>
                    </div>
                  </TableCell>

                  {/* Risk Source */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="quiet" className="w-fit">
                        <MapPin className="h-3 w-3" />
                        {getRiskSourceDisplayName(risk.riskSource)}
                      </Badge>
                      {risk.sourceReference && (
                        <p className="text-xs text-c4c-petrol truncate max-w-[150px]" title={risk.sourceReference}>
                          {risk.sourceReference}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Risk Type */}
                  <TableCell>
                    <Badge variant="quiet">
                      {getRiskTypeDisplayName(risk.riskType)}
                    </Badge>
                  </TableCell>

                  {/* Risk Score */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRiskScoreIcon(risk.riskScore)}
                      <Badge variant={getRiskScoreVariant(risk.riskScore)}>
                        {risk.riskScore.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(risk.status)}
                      <span className="text-sm text-black capitalize">
                        {risk.status}
                      </span>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-c4c-petrol flex-shrink-0" />
                      <span className="text-sm text-black truncate max-w-[120px]" title={risk.owner.name}>
                        {risk.owner.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Review Date */}
                  <TableCell>
                    {risk.reviewDate ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-c4c-petrol flex-shrink-0" />
                          <span className="text-sm text-black">
                            {new Date(risk.reviewDate).toLocaleDateString()}
                          </span>
                        </div>
                        {risk.isReviewOverdue && (
                          <Badge variant="attention" className="w-fit">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-c4c-petrol">Not set</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewRisk(risk._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <>
                            <DropdownMenuItem onClick={() => onEditRisk(risk)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Risk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onArchiveRisk(risk._id)}
                              className="text-destructive"
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
                      <AlertTriangle className="h-12 w-12 text-c4c-rule" />
                      <p className="text-black font-medium">No risks found</p>
                      <p className="text-c4c-petrol text-sm">
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