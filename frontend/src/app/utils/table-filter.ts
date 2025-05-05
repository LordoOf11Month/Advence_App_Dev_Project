export interface FilterConfig {
  field: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  secondValue?: any; // For 'between' operator
}

export function filterData<T>(data: T[], filters: FilterConfig[]): T[] {
  return data.filter(item => {
    return filters.every(filter => {
      const value = (item as any)[filter.field];
      
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
        case 'greaterThan':
          return value > filter.value;
        case 'lessThan':
          return value < filter.value;
        case 'between':
          return value >= filter.value && value <= filter.secondValue;
        default:
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      }
    });
  });
}

export function createFilter(
  field: string, 
  value: any, 
  operator?: FilterConfig['operator'],
  secondValue?: any
): FilterConfig {
  return {
    field,
    value,
    operator,
    secondValue
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, key) => 
    (o && o[key] !== undefined ? o[key] : null), obj
  );
}

export function applyQuickFilter<T>(
  data: T[], 
  searchTerm: string, 
  columns: string[]
): T[] {
  if (!searchTerm) {
    return data;
  }

  const lowercaseSearch = searchTerm.toLowerCase();

  return data.filter(item =>
    columns.some(column => {
      const value = getNestedValue(item, column);
      return value && 
        String(value)
          .toLowerCase()
          .includes(lowercaseSearch);
    })
  );
}

export function createDateRangeFilter(
  field: string,
  startDate: Date,
  endDate: Date
): FilterConfig {
  return {
    field,
    value: startDate,
    operator: 'between',
    secondValue: endDate
  };
}