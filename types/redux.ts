// Redux-related types

// Root state type (you already have this in store.ts, but centralizing here)
export interface RootState {
  auth: {
    user: {
      id: string;
      email?: string;
      name?: string;
      phoneNumber?: string;
    };
    isAuthenticated: boolean;
    loading: boolean;
  };
  broadcast: {
    isBroadcasting: boolean;
  };
  contacts: {
    sentInvites: any[]; // You can type this more specifically later
    friends: any[];     // You can type this more specifically later
  };
  meetings: {
    meetings: any[];    // You can type this more specifically later
  };
  // Add other slices as needed
}

// Common Redux action types
export interface AsyncThunkConfig {
  state: RootState;
  rejectValue: string;
}

// Common slice state interface
export interface BaseSliceState {
  loading: boolean;
  error: string | null;
}

// Common action payloads
export interface SetLoadingAction {
  loading: boolean;
}

export interface SetErrorAction {
  error: string | null;
}
