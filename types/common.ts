// Common types used across the application

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Common form states
export interface FormState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Common UI component props
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}

// Window dimensions (commonly used)
export interface WindowDimensions {
  width: number;
  height: number;
}

// Common button props
export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Common input props
export interface InputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}
