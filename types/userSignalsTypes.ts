import { BaseEntity } from "./common";

export type SignalType = "CALL_INTENT" | "WORK_HOURS" | "CALL_TIME_PREFERENCE";

export const CALL_INTENT_SIGNAL_TYPE: SignalType = "CALL_INTENT" as const;
export const WORK_HOURS_SIGNAL_TYPE: SignalType = "WORK_HOURS" as const;
export const CALL_TIME_PREFERENCE_SIGNAL_TYPE: SignalType = "CALL_TIME_PREFERENCE" as const;


export type CallIntentPayload = {
    targetUserId: string;
};

export type WorkHoursPayload = {
    startHour: number; // 0-23
    endHour: number; // 0-23
};

export type CallTimePreferencePayload = {
    preferredTimes: ("MORNING" | "AFTERNOON" | "EVENING" | "LATE_NIGHT")[];
    timezone?: string; // IANA timezone string (e.g., "America/New_York")
};

export type SignalPayloadMap = {
    CALL_INTENT: CallIntentPayload;
    WORK_HOURS: WorkHoursPayload;
    CALL_TIME_PREFERENCE: CallTimePreferencePayload;
}

export interface UserSignal<T extends SignalType> extends BaseEntity {
    userId: string;
    type: T;
    payload: SignalPayloadMap[];
    startsAt: Date | null;
    endsAt: Date | null;
  }