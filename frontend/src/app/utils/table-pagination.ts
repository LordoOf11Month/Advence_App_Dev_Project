export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export function paginateData<T>(
  data: T[],
  config: PaginationConfig
): PaginationResult<T> {
  const { currentPage, pageSize, totalItems } = config;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Ensure current page is within bounds
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  
  // Calculate start and end indices
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get the items for the current page
  const items = data.slice(startIndex, endIndex);
  
  return {
    items,
    currentPage: validCurrentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex: startIndex + 1,
    endIndex,
    hasPreviousPage: validCurrentPage > 1,
    hasNextPage: validCurrentPage < totalPages
  };
}

export function getPageSizes(): number[] {
  return [5, 10, 25, 50, 100];
}

export function calculateVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 5
): number[] {
  const pages: number[] = [];
  
  if (totalPages <= maxVisiblePages) {
    // If total pages is less than max visible, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Calculate range of visible pages
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    // Adjust if end page exceeds total pages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  }
  
  return pages;
}

export function getDisplayText(
  startIndex: number,
  endIndex: number,
  totalItems: number
): string {
  return `Showing ${startIndex} to ${endIndex} of ${totalItems} entries`;
}

export function jumpToPage(
  targetPage: number,
  currentConfig: PaginationConfig
): PaginationConfig {
  const totalPages = Math.ceil(currentConfig.totalItems / currentConfig.pageSize);
  const newPage = Math.max(1, Math.min(targetPage, totalPages));
  
  return {
    ...currentConfig,
    currentPage: newPage
  };
}

export function changePageSize(
  newSize: number,
  currentConfig: PaginationConfig
): PaginationConfig {
  const newTotalPages = Math.ceil(currentConfig.totalItems / newSize);
  const adjustedCurrentPage = Math.min(currentConfig.currentPage, newTotalPages);
  
  return {
    ...currentConfig,
    pageSize: newSize,
    currentPage: adjustedCurrentPage
  };
}