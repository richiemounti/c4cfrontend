// components/admin/taxonomy/TaxonomyCard.tsx
import React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MoreVertical, Edit, Archive, Trash, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaxonomyCardProps {
  item: {
    _id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  type: 'category' | 'theme' | 'subtheme' | 'indicator' | 'esg-category' | 'resilience-dimension' | 'sdg' | 'standard';
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  // Add this new prop:
  extraInfo?: React.ReactNode;
}

const TaxonomyCard: React.FC<TaxonomyCardProps> = ({ 
  item, 
  type, 
  onArchive, 
  onRestore, 
  onDelete,
  extraInfo
}) => {
  const isArchived = item.status === 'archived';

  const typePluralMap: Record<string, string> = {
    'category': 'categories',
    'theme': 'themes',
    'subtheme': 'subthemes',
    'indicator': 'indicators',
    'esg-category': 'esg-categories',
    'resilience-dimension': 'resilience-dimensions',
    'sdg': 'sdgs',
    'standard': 'standards',
  };
  const editPath = `/admin/${typePluralMap[type] ?? type + 's'}/builder?id=${item._id}`;

  return (
    <Card className="mb-4 shadow-sm bg-white border border-stratosphere">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium text-stratosphere">{item.name}</CardTitle>
            <CardDescription className="text-sm text-stratosphere-500 mt-1">
              <div className="flex items-center gap-1 text-xs text-stratosphere-500">
                <Calendar className="h-3 w-3" />
                <span>
                  Updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ">
            <Badge variant={isArchived ? "destructive" : (item.status === 'published' ? "default" : "secondary")}>
              {item.status}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-stratosphere hover:bg-stratosphere hover:text-white">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isArchived && (
                  <DropdownMenuItem asChild>
                    <Link href={editPath} className="text-stratosphere hover:text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {!isArchived ? (
                  <DropdownMenuItem onClick={() => onArchive(item._id)} className="text-stratosphere hover:text-white">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onRestore(item._id)} className="text-stratosphere hover:text-white">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => onDelete(item._id)}
                  className="text-red-600 focus:text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {item.description ? (
          <p className="text-sm text-stratosphere-500 mt-2">{item.description}</p>
        ) : (
          <p className="text-sm text-concrete-500 italic mt-2">No description provided</p>
        )}
        {/* Add this line to render the extraInfo */}
        {extraInfo && <div className="mt-2">{extraInfo}</div>}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-end w-full">
          <Button variant="outline" size="sm" asChild className="border-stratosphere text-stratosphere bg-sky-50 hover:bg-stratosphere hover:text-white">
            <Link href={editPath}>
              <Edit className="h-4 w-4 mr-2" />
              {isArchived ? "View" : "Edit"}
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaxonomyCard;