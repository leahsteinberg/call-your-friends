import { ProcessedOfferType } from './types';
import { isBroadcastMeeting, isAdvanceMeeting } from '../Meetings/meetingHelpers';

/**
 * Check if offer is for a broadcast meeting
 * Replaces: offer.offerType === 'BROADCAST'
 */
export function isBroadcastOffer(offer: ProcessedOfferType): boolean {
  return offer.meeting ? isBroadcastMeeting(offer.meeting) : false;
}

/**
 * Check if offer is for an advance meeting
 * Replaces: offer.offerType === 'ADVANCE'
 */
export function isAdvanceOffer(offer: ProcessedOfferType): boolean {
  return offer.meeting ? isAdvanceMeeting(offer.meeting) : false;
}
