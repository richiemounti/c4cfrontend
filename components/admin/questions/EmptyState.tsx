// components/admin/questions/EmptyState.tsx
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState = ({ hasFilters }: EmptyStateProps) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No questions found</h3>
          <p className="text-muted-foreground mt-1">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Create your first question to get started"}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/questions/builder">
              <Plus className="mr-2 h-4 w-4" /> Create Question
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;