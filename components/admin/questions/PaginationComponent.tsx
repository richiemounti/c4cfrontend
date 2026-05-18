// components/admin/questions/PaginationComponent.tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationComponentProps) => {
  if (totalPages <= 1) {
    return null;
  }

  // Helper to generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={`
                ${currentPage <= 1 
                  ? "pointer-events-none opacity-50 bg-concrete-100" 
                  : "hover:bg-sky-100 text-stratosphere border-stratosphere-200"
                }
              `}
            />
          </PaginationItem>
          
          {pages.map((pageNum, idx) => (
            <PaginationItem key={`page-${idx}`}>
              {pageNum === 'ellipsis' ? (
                <PaginationEllipsis className="text-stratosphere" />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(pageNum);
                  }}
                  isActive={currentPage === pageNum}
                  className={
                    currentPage === pageNum
                      ? "bg-stratosphere text-white hover:bg-stratosphere-900 border-stratosphere"
                      : "text-stratosphere hover:bg-sky-50 border-stratosphere-200"
                  }
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={`
                ${currentPage >= totalPages 
                  ? "pointer-events-none opacity-50 bg-concrete-100" 
                  : "hover:bg-sky-100 text-stratosphere border-stratosphere-200"
                }
              `}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComponent;