// Offer State Type
export type OfferState = "OPEN" | "ACCEPTED" | "REJECTED" | "EXPIRED";

// Meeting State Type
export type MeetingState = "DRAFT" | "SEARCHING" | "ACCEPTED" | "REJECTED" | "PAST" | "EXPIRED" | "DISMISSED_DRAFT" | "CANCELED";

// Deprecated MeetingType (for backwards compatibility during migration)
export type MeetingType = "ADVANCE" | "BROADCAST";

// Helper Type
export type MeetingActorRole = "INITIATOR" | "ACCEPTOR" | "SPECIFIC_TARGET" | "OPEN_TARGET" | "SYSTEM";

// Offer State Constants (type-safe with assertions)
export const OPEN_OFFER_STATE: OfferState = 'OPEN' as const;
export const ACCEPTED_OFFER_STATE: OfferState = 'ACCEPTED' as const;
export const REJECTED_OFFER_STATE: OfferState = 'REJECTED' as const;
export const EXPIRED_OFFER_STATE: OfferState = 'EXPIRED' as const;

// Meeting State Constants (type-safe with assertions)
export const DRAFT_MEETING_STATE: MeetingState = 'DRAFT' as const;
export const SEARCHING_MEETING_STATE: MeetingState = 'SEARCHING' as const;
export const ACCEPTED_MEETING_STATE: MeetingState = 'ACCEPTED' as const;
export const REJECTED_MEETING_STATE: MeetingState = 'REJECTED' as const;
export const PAST_MEETING_STATE: MeetingState = 'PAST' as const;
export const EXPIRED_MEETING_STATE: MeetingState = 'EXPIRED' as const;
export const DISMISSED_DRAFT_MEETING_STATE: MeetingState = 'DISMISSED_DRAFT' as const;
export const CANCELED_MEETING_STATE: MeetingState = 'CANCELED' as const;
