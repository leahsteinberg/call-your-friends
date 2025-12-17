import { BaseEntity } from "./common";

export type SignalType = "WALK_PATTERN" | "CALL_INTENT";

export const WALK_PATTERN_SIGNAL_TYPE: SignalType = "WALK_PATTERN" as const;
export const CALL_INTENT_SIGNAL_TYPE: SignalType = "CALL_INTENT" as const;


export type WalkPatternPayload = {};

export type CallIntentPayload = {};

export type SignalPayloadMap = {
    WALK_PATTERN: WalkPatternPayload;
    CALL_INTENT: CallIntentPayload;
}

export interface UserSignal<T extends SignalType> extends BaseEntity {
    userId: string;
    type: T;
    payload: SignalPayloadMap[];
    startsAt: Date | null;
    endsAt: Date | null;
  }