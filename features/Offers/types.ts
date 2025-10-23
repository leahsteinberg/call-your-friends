export interface OfferType extends BaseEntity {
    meetingId: string;
    offerState: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

