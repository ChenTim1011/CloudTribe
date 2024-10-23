import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

/**
 * PaginationDemo component displays a pagination control for navigating through a list of items.
 *
 * @param totalItems - The total number of items in the list.
 * @param itemsPerPage - The number of items to display per page.
 * @param currentPage - The current page number.
 * @param onPageChange - A callback function to handle page change events.
 */
const PaginationDemo: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageRange = 5;

  /**
   * Handles the click event when a page number is clicked.
   *
   * @param page - The page number that was clicked.
   */
  const handleClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  /**
   * Returns an array of page numbers to display in the pagination control.
   *
   * @returns An array of page numbers.
   */
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(currentPage - Math.floor(pageRange / 2), 1);
    let endPage = Math.min(startPage + pageRange - 1, totalPages);

    if (endPage - startPage + 1 < pageRange) {
      startPage = Math.max(endPage - pageRange + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => handleClick(currentPage - 1)}
            className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}
          />
        </PaginationItem>

        {pageNumbers.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={currentPage === page}
              onClick={() => handleClick(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => handleClick(currentPage + 1)}
            className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationDemo;
