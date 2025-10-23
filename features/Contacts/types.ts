import { BaseEntity } from "@/types/common";

// Contact-specific types
export interface Contact extends BaseEntity {
  name: string;
  phoneNumber: string;
  email?: string;
  isInvited?: boolean;
  isFriend?: boolean;
}

export interface Friend extends BaseEntity {
  name: string;
  phoneNumber: string;
  email?: string;
  userId: string;
}

export interface SentInvite extends BaseEntity {
  userToPhoneNumber: string;
  firstName?: string;
  lastName?: string;
  digits: string;
  label?: string;
  number?: string;
  countryCode?: string;
  token?: string;
}

export interface Invite extends BaseEntity {
  fromUserId: string;
  toPhoneNumber: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  token?: string;
}

// Expo Contacts types
export interface ExpoContact {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: PhoneNumber[];
  contactType: 'person' | 'company';
  imageAvailable: boolean;
}

export interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  digits: string;
  countryCode: string;
}

// Component props
export interface ContactsComponentProps {
  // Add any specific props if needed
}

export interface ContactsListProps {
  friends: Friend[];
  sentInvites: SentInvite[];
}

export interface ContactsSelectorProps {
  // Add any specific props if needed
}

export interface InvitePhoneNumberProps {
  // Add any specific props if needed
}

export interface InvitedContactProps {
  contact: {
    item: SentInvite;
    index: number;
  };
}

export interface FriendProps {
  item: {
    name: string;
    phoneNumber: string;
    index?: number;
  };
}

// API types
export interface GetContactsRequest {
  userId: string;
}

export interface SendInviteRequest {
  userFromId: string;
  userToPhoneNumber: string;
  message?: string;
}

export interface GetFriendsRequest {
  id: string;
}

export interface GetSentInvitesRequest {
  id: string;
}

export interface CreateInviteRequest {
  userFromId: string;
  userToPhoneNumber: string;
}

export interface CreateInviteResponse {
  token: string;
  data: SentInvite;
}

// Redux state
export interface ContactsState {
  sentInvites: SentInvite[];
}

