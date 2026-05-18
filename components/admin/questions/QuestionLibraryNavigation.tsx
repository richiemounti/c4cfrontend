// components/admin/questions/QuestionLibraryNavigation.tsx
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Library, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestionLibraryNavigationProps {
  className?: string;
}

const QuestionLibraryNavigation = ({ className }: QuestionLibraryNavigationProps) => {
  const pathname = usePathname();
  
  const isQuestionsActive = pathname === '/admin/questions' || pathname?.startsWith('/admin/questions/builder');
  const isLibrariesActive = pathname === '/admin/libraries' || pathname?.startsWith('/admin/libraries/');
  
  return (
    <div className={cn("flex items-center space-x-2 mb-6", className)}>
      <Button 
        variant={isQuestionsActive ? "default" : "outline"} 
        size="sm"
        asChild
      >
        <Link href="/admin/questions">
          <BookOpen className="h-4 w-4 mr-2" />
          Questions
        </Link>
      </Button>
      
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      
      <Button 
        variant={isLibrariesActive ? "default" : "outline"} 
        size="sm"
        asChild
      >
        <Link href="/admin/libraries">
          <Library className="h-4 w-4 mr-2" />
          Libraries
        </Link>
      </Button>
    </div>
  );
};

export default QuestionLibraryNavigation;