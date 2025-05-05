export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export function sortData<T>(data: T[], config: SortConfig): T[] {
  return [...data].sort((a: any, b: any) => {
    const aValue = a[config.column];
    const bValue = b[config.column];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return config.direction === 'asc' ? comparison : -comparison;
  });
}

export function toggleSort(currentConfig: SortConfig, column: string): SortConfig {
  if (currentConfig.column === column) {
    return {
      column,
      direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
    };
  }
  
  return {
    column,
    direction: 'asc'
  };
}

export function toggleSortDirection(current?: 'asc' | 'desc'): 'asc' | 'desc' {
  if (!current || current === 'desc') {
    return 'asc';
  }
  return 'desc';
}

export function getSortedColumn(sortConfig: SortConfig | null): string {
  return sortConfig?.column || '';
}

export function getSortDirection(sortConfig: SortConfig | null): 'asc' | 'desc' | '' {
  return sortConfig?.direction || '';
}

export function getSortIcon(column: string, sortConfig: SortConfig | null): string {
  if (sortConfig?.column !== column) {
    return '↕️';
  }
  return sortConfig.direction === 'asc' ? '↑' : '↓';
}