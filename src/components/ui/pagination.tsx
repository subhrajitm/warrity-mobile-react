"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range of pages to show around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= 2) {
      endPage = Math.min(4, totalPages - 1);
    } else if (currentPage >= totalPages - 1) {
      startPage = Math.max(2, totalPages - 3);
    }
    
    // Add ellipsis if needed before middle pages
    if (startPage > 2) {
      pageNumbers.push('ellipsis-start');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed after middle pages
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis-end');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className={cn("flex justify-center items-center space-x-1", className)} aria-label="Pagination">
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
          return (
            <span 
              key={`ellipsis-${index}`} 
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        
        const pageNum = page as number;
        const isCurrentPage = pageNum === currentPage;
        
        return (
          <Button
            key={pageNum}
            variant={isCurrentPage ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pageNum)}
            disabled={isCurrentPage}
            aria-label={`Page ${pageNum}`}
            aria-current={isCurrentPage ? "page" : undefined}
          >
            {pageNum}
          </Button>
        );
      })}
      
      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
