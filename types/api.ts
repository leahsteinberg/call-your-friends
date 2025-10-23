// Common API types used across features

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Common request/response patterns
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common API endpoints
export interface CreateRequest {
  // Base interface for create operations
}

export interface UpdateRequest {
  id: string;
  // Base interface for update operations
}

export interface DeleteRequest {
  id: string;
}

// Common API hook return types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
