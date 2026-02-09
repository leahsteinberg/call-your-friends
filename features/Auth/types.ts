import { BaseEntity } from '../../types/common';

// Auth-specific types
export interface User extends BaseEntity {
  email?: string;
  name?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;
}

// Component props
export interface AuthComponentProps {
  // Add any specific props if needed
}

export interface PhoneNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export interface UserDataInputProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  errors?: {
    name?: string;
    email?: string;
  };
}

// API types
export interface SignInRequest {
  phoneNumber: string;
  password: string;
}

export interface SignUpRequest {
  phoneNumber: string;
  password: string;
  name: string;
  email?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
