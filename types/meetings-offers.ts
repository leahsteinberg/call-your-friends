export const OPEN_OFFER_STATE = 'OPEN';
export const ACCEPTED_OFFER_STATE = 'ACCEPTED';
export const REJECTED_OFFER_STATE = 'REJECTED';
export const EXPIRED_OFFER_STATE = 'EXPIRED';


export const ACCEPTED_MEETING_STATE = 'ACCEPTED';
export const SEARCHING_MEETING_STATE = 'SEARCHING';
export const REJECTED_MEETING_STATE = 'REJECTED';
export const PAST_MEETING_STATE = 'PAST';

export type OfferState = 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type MeetingState = 'SEARCHING' | 'ACCEPTED' | 'REJECTED' | 'PAST';
