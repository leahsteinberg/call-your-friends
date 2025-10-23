// Navigation-related types

// Common navigation props
export interface NavigationProps {
  navigation: any; // You can type this more specifically with React Navigation types
  route: any;      // You can type this more specifically with React Navigation types
}

// Common screen props
export interface ScreenProps extends NavigationProps {
  // Add common screen props here
}

// Route params (example)
export interface RouteParams {
  [key: string]: any;
}

// Common navigation actions
export interface NavigateAction {
  screen: string;
  params?: RouteParams;
}
