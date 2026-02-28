import Avatar from "@/components/Avatar/Avatar";
import { VIBE_WORDS } from "@/components/CardActionDecorations/VibeButton";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { useBroadcastSettings } from "@/features/Broadcast/BroadcastSettingsContext";
import CardErrorBanner, { extractErrorMessage } from "@/features/EventCards/CardErrorBanner";
import UnifiedDateTimePicker from "@/features/Meetings/UnifiedDateTimePicker";
import { useAcceptSuggestionMutation, useCreateSmartMeetingMutation } from "@/services/meetingApi";
import { BURGUNDY, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { formatTimeOnly, formatTimezone } from "@/utils/timeStringUtils";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSelector } from "react-redux";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72;
const SWIPE_THRESHOLD = 50;

type Phase = 'form' | 'submitting' | 'draft';

type DraftMeeting = {
    id: string;
    meetingState: string;
    scheduledFor: string;
    suggestionReason?: string;
    title: string;
    [key: string]: any;
};

export default function SmartCallButton(): React.JSX.Element {
    const { friends, groups } = useBroadcastSettings();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [createSmartMeeting] = useCreateSmartMeetingMutation();
    const [acceptSuggestion] = useAcceptSuggestionMutation();

    const [isOpen, setIsOpen] = useState(false);
    const [phase, setPhase] = useState<Phase>('form');
    const [draftMeeting, setDraftMeeting] = useState<DraftMeeting | null>(null);
    const [error, setError] = useState<string | null>(null);

    // form fields
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
    const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
    const [title, setTitle] = useState('');

    // expansion toggles
    const [whoExpanded, setWhoExpanded] = useState(false);
    const [whenExpanded, setWhenExpanded] = useState(false);

    const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

    useEffect(() => {
        if (!error) return;
        const t = setTimeout(() => setError(null), 4000);
        return () => clearTimeout(t);
    }, [error]);

    const openSheet = () => {
        sheetTranslateY.setValue(SHEET_HEIGHT);
        // Start animation before setIsOpen so the value is already animating
        // when the Modal renders — avoids the frame-timing issue on iOS.
        Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
        setIsOpen(true);
    };

    const closeSheet = () => {
        Animated.spring(sheetTranslateY, {
            toValue: SHEET_HEIGHT,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start(() => {
            setIsOpen(false);
            resetForm();
        });
    };

    const resetForm = () => {
        setPhase('form');
        setDraftMeeting(null);
        setError(null);
        setSelectedFriendIds([]);
        setSelectedGroupId(null);
        setSelectedDateTime(null);
        setSelectedVibe(null);
        setTitle('');
        setWhoExpanded(false);
        setWhenExpanded(false);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) sheetTranslateY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > SWIPE_THRESHOLD) {
                    closeSheet();
                } else {
                    Animated.spring(sheetTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 65,
                        friction: 11,
                    }).start();
                }
            },
        })
    ).current;

    const toggleFriend = (friendUserId: string) => {
        setSelectedGroupId(null);
        setSelectedFriendIds(prev =>
            prev.includes(friendUserId)
                ? prev.filter(id => id !== friendUserId)
                : [...prev, friendUserId]
        );
    };

    const toggleGroup = (groupId: string) => {
        setSelectedFriendIds([]);
        setSelectedGroupId(prev => prev === groupId ? null : groupId);
    };

    const whoSummary = (): string | null => {
        if (selectedGroupId) {
            return groups.find(g => g.id === selectedGroupId)?.name ?? 'Group';
        }
        if (selectedFriendIds.length === 1) {
            return friends.find(f => f.userId === selectedFriendIds[0])?.name ?? 'Friend';
        }
        if (selectedFriendIds.length > 1) {
            return `${selectedFriendIds.length} friends`;
        }
        return null;
    };

    const whenSummary = (): string | null => {
        if (!selectedDateTime) return null;
        const day = selectedDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const time = formatTimeOnly(selectedDateTime.toISOString());
        return `${day} · ${time}`;
    };

    const handleCall = async () => {
        try {
            setPhase('submitting');
            setError(null);
            const result = await createSmartMeeting({
                userFromId: userId,
                ...(selectedFriendIds.length && { targetUserIds: selectedFriendIds }),
                ...(selectedGroupId && { groupId: selectedGroupId }),
                ...(selectedDateTime && { scheduledFor: selectedDateTime.toISOString() }),
                ...(title.trim() && { title: title.trim() }),
                ...(selectedVibe && { intentLabel: selectedVibe }),
            }).unwrap();

            if (result.meetingState === 'DRAFT') {
                setDraftMeeting(result);
                setPhase('draft');
            } else {
                closeSheet();
            }
        } catch (err) {
            console.error('Error creating smart meeting:', err);
            setError(extractErrorMessage(err));
            setPhase('form');
        }
    };

    const handleAccept = async () => {
        if (!draftMeeting) return;
        try {
            setPhase('submitting');
            await acceptSuggestion({
                meetingId: draftMeeting.id,
                userId,
                scheduledFor: draftMeeting.scheduledFor,
            }).unwrap();
            closeSheet();
        } catch (err) {
            console.error('Error accepting suggestion:', err);
            setError(extractErrorMessage(err));
            setPhase('draft');
        }
    };

    const handleEditTime = () => {
        if (draftMeeting?.scheduledFor) {
            setSelectedDateTime(new Date(draftMeeting.scheduledFor));
        }
        setWhenExpanded(true);
        setPhase('form');
    };

    const isSubmitting = phase === 'submitting';

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.fab} onPress={openSheet} activeOpacity={0.85}>
                <IconSymbol name="phone.fill" size={22} color={CREAM} />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={closeSheet}
            >
                {/* pointerEvents="box-none" so this wrapper doesn't steal touches */}
                <View pointerEvents="box-none" style={styles.modalRoot}>
                    {/* Dark overlay — tap to dismiss */}
                    <TouchableWithoutFeedback onPress={closeSheet}>
                        <View style={styles.overlay} />
                    </TouchableWithoutFeedback>

                    {/* Sheet — on top of overlay, absorbs all its own touches */}
                    <Animated.View
                        style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
                    >
                        {/* onStartShouldSetResponder stops touches on the sheet from
                            falling through to the overlay TouchableWithoutFeedback */}
                        <View onStartShouldSetResponder={() => true} style={styles.sheetInner}>
                            {/* Drag handle */}
                            <View {...panResponder.panHandlers} style={styles.handleArea}>
                                <View style={styles.handle} />
                            </View>

                            {phase === 'draft' && draftMeeting
                                ? <DraftView
                                    draftMeeting={draftMeeting}
                                    isSubmitting={isSubmitting}
                                    error={error}
                                    onAccept={handleAccept}
                                    onEditTime={handleEditTime}
                                    onBack={() => setPhase('form')}
                                />
                                : <FormView
                                    friends={friends}
                                    groups={groups}
                                    selectedFriendIds={selectedFriendIds}
                                    selectedGroupId={selectedGroupId}
                                    selectedDateTime={selectedDateTime}
                                    selectedVibe={selectedVibe}
                                    title={title}
                                    whoExpanded={whoExpanded}
                                    whenExpanded={whenExpanded}
                                    isSubmitting={isSubmitting}
                                    error={error}
                                    whoSummary={whoSummary()}
                                    whenSummary={whenSummary()}
                                    onToggleFriend={toggleFriend}
                                    onToggleGroup={toggleGroup}
                                    onToggleWho={() => setWhoExpanded(p => !p)}
                                    onToggleWhen={() => setWhenExpanded(p => !p)}
                                    onDateTimeSelect={setSelectedDateTime}
                                    onVibeSelect={id => setSelectedVibe(prev => prev === id ? null : id)}
                                    onTitleChange={setTitle}
                                    onCall={handleCall}
                                />
                            }
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

// ─── Form phase ─────────────────────────────────────────────────────────────

interface FormViewProps {
    friends: ReturnType<typeof useBroadcastSettings>['friends'];
    groups: ReturnType<typeof useBroadcastSettings>['groups'];
    selectedFriendIds: string[];
    selectedGroupId: string | null;
    selectedDateTime: Date | null;
    selectedVibe: string | null;
    title: string;
    whoExpanded: boolean;
    whenExpanded: boolean;
    isSubmitting: boolean;
    error: string | null;
    whoSummary: string | null;
    whenSummary: string | null;
    onToggleFriend: (id: string) => void;
    onToggleGroup: (id: string) => void;
    onToggleWho: () => void;
    onToggleWhen: () => void;
    onDateTimeSelect: (date: Date) => void;
    onVibeSelect: (id: string) => void;
    onTitleChange: (t: string) => void;
    onCall: () => void;
}

function FormView({
    friends, groups,
    selectedFriendIds, selectedGroupId, selectedDateTime, selectedVibe, title,
    whoExpanded, whenExpanded, isSubmitting, error,
    whoSummary, whenSummary,
    onToggleFriend, onToggleGroup, onToggleWho, onToggleWhen,
    onDateTimeSelect, onVibeSelect, onTitleChange, onCall,
}: FormViewProps) {
    return (
        <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.sheetTitle}>Call someone</Text>

            {/* Who? */}
            <TouchableOpacity style={styles.fieldRow} onPress={onToggleWho} activeOpacity={0.7}>
                <Text style={styles.fieldLabel}>Who?</Text>
                <Text style={[styles.fieldValue, !whoSummary && styles.fieldPlaceholder]} numberOfLines={1}>
                    {whoSummary ?? 'Anyone'}
                </Text>
                <IconSymbol
                    name={whoExpanded ? 'chevron.up' : 'chevron.down'}
                    size={14}
                    color="rgba(0,0,0,0.35)"
                />
            </TouchableOpacity>

            {whoExpanded && (
                <View style={styles.pickerContainer}>
                    {friends.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.friendScroll}
                        >
                            {friends.map(friend => {
                                const selected = selectedFriendIds.includes(friend.userId);
                                return (
                                    <TouchableOpacity
                                        key={friend.userId}
                                        onPress={() => onToggleFriend(friend.userId)}
                                        style={[styles.friendBubble, selected && styles.friendBubbleSelected]}
                                        activeOpacity={0.75}
                                    >
                                        <Avatar
                                            name={friend.name}
                                            avatarUrl={friend.avatarUrl}
                                            size={44}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                    {groups.length > 0 && (
                        <View style={styles.groupPillRow}>
                            {groups.map(group => {
                                const selected = selectedGroupId === group.id;
                                return (
                                    <TouchableOpacity
                                        key={group.id}
                                        onPress={() => onToggleGroup(group.id)}
                                        style={[styles.groupPill, selected && styles.groupPillSelected]}
                                        activeOpacity={0.75}
                                    >
                                        <IconSymbol name="person.2.fill" size={11} color={selected ? CREAM : BURGUNDY} />
                                        <Text style={[styles.groupPillText, selected && styles.groupPillTextSelected]}>
                                            {group.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            )}

            <View style={styles.divider} />

            {/* When? */}
            <TouchableOpacity style={styles.fieldRow} onPress={onToggleWhen} activeOpacity={0.7}>
                <Text style={styles.fieldLabel}>When?</Text>
                <Text style={[styles.fieldValue, !whenSummary && styles.fieldPlaceholder]} numberOfLines={1}>
                    {whenSummary ?? "We'll suggest"}
                </Text>
                <IconSymbol
                    name={whenExpanded ? 'chevron.up' : 'chevron.down'}
                    size={14}
                    color="rgba(0,0,0,0.35)"
                />
            </TouchableOpacity>

            {whenExpanded && (
                <View style={styles.pickerContainer}>
                    <UnifiedDateTimePicker
                        onDateTimeSelect={onDateTimeSelect}
                        selectedDateTime={selectedDateTime ?? undefined}
                    />
                </View>
            )}

            <View style={styles.divider} />

            {/* Vibe pills */}
            <View style={styles.vibeRow}>
                {VIBE_WORDS.map(v => {
                    const selected = selectedVibe === v.id;
                    return (
                        <TouchableOpacity
                            key={v.id}
                            onPress={() => onVibeSelect(v.id)}
                            style={[styles.vibePill, selected && styles.vibePillSelected]}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.vibePillText, selected && styles.vibePillTextSelected]}>
                                {v.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Title input */}
            <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={onTitleChange}
                placeholder="Add a title…"
                placeholderTextColor="rgba(0,0,0,0.3)"
                returnKeyType="done"
                blurOnSubmit
                maxLength={80}
            />

            {error && <CardErrorBanner key={error} message={error} />}

            <TouchableOpacity
                style={[styles.callButton, isSubmitting && styles.callButtonDisabled]}
                onPress={onCall}
                disabled={isSubmitting}
                activeOpacity={0.85}
            >
                {isSubmitting
                    ? <ActivityIndicator size="small" color={CREAM} />
                    : <>
                        <IconSymbol name="phone.fill" size={16} color={CREAM} />
                        <Text style={styles.callButtonText}>Call</Text>
                    </>
                }
            </TouchableOpacity>
        </ScrollView>
    );
}

// ─── Draft phase ─────────────────────────────────────────────────────────────

interface DraftViewProps {
    draftMeeting: DraftMeeting;
    isSubmitting: boolean;
    error: string | null;
    onAccept: () => void;
    onEditTime: () => void;
    onBack: () => void;
}

function DraftView({ draftMeeting, isSubmitting, error, onAccept, onEditTime, onBack }: DraftViewProps) {
    const timeStr = formatTimeOnly(draftMeeting.scheduledFor);
    const tzStr = formatTimezone(draftMeeting.scheduledFor);
    const date = new Date(draftMeeting.scheduledFor);
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <View style={styles.draftContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
                <View style={styles.backChevron}>
                    <IconSymbol name="chevron.down" size={14} color={BURGUNDY} />
                </View>
                <Text style={styles.backLabel}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.draftHeading}>We have a suggestion</Text>

            <View style={styles.draftTimeBlock}>
                <Text style={styles.draftTime}>{timeStr}</Text>
                <Text style={styles.draftTz}>{tzStr}</Text>
                <Text style={styles.draftDay}>{dayStr}</Text>
            </View>

            {draftMeeting.suggestionReason ? (
                <Text style={styles.draftReason}>{draftMeeting.suggestionReason}</Text>
            ) : null}

            {error && <CardErrorBanner key={error} message={error} />}

            <TouchableOpacity
                style={[styles.callButton, isSubmitting && styles.callButtonDisabled]}
                onPress={onAccept}
                disabled={isSubmitting}
                activeOpacity={0.85}
            >
                {isSubmitting
                    ? <ActivityIndicator size="small" color={CREAM} />
                    : <>
                        <IconSymbol name="checkmark" size={14} color={CREAM} />
                        <Text style={styles.callButtonText}>Looks good</Text>
                    </>
                }
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.editTimeButton}
                onPress={onEditTime}
                disabled={isSubmitting}
                activeOpacity={0.7}
            >
                <Text style={styles.editTimeText}>Edit time</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        // holds absolutely-positioned children only
    },
    fab: {
        position: 'absolute',
        bottom: 110,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: BURGUNDY,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.28,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 1001,
    },
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        height: SHEET_HEIGHT,
        backgroundColor: CREAM,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 12,
        overflow: 'hidden',
    },
    sheetInner: {
        flex: 1,
    },
    handleArea: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    handle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    // Form
    formScroll: {
        flex: 1,
    },
    formContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
        gap: 4,
    },
    sheetTitle: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 18,
        color: '#1a1a1a',
        marginBottom: 12,
        marginTop: 2,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    fieldLabel: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 13,
        color: '#1a1a1a',
        width: 46,
    },
    fieldValue: {
        flex: 1,
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 13,
        color: '#1a1a1a',
    },
    fieldPlaceholder: {
        color: 'rgba(0,0,0,0.35)',
        fontStyle: 'italic',
    },
    pickerContainer: {
        paddingBottom: 8,
        gap: 10,
    },
    friendScroll: {
        gap: 10,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    friendBubble: {
        borderRadius: 30,
        padding: 3,
        borderWidth: 2.5,
        borderColor: 'transparent',
    },
    friendBubbleSelected: {
        borderColor: BURGUNDY,
    },
    groupPillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    groupPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    groupPillSelected: {
        backgroundColor: BURGUNDY,
    },
    groupPillText: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 13,
        color: BURGUNDY,
    },
    groupPillTextSelected: {
        color: CREAM,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: 2,
    },
    vibeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 10,
    },
    vibePill: {
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    vibePillSelected: {
        backgroundColor: BURGUNDY,
    },
    vibePillText: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 13,
        color: '#1a1a1a',
    },
    vibePillTextSelected: {
        color: CREAM,
    },
    titleInput: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 14,
        color: '#1a1a1a',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.15)',
        marginTop: 10,
        marginBottom: 8,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: BURGUNDY,
        borderRadius: 14,
        paddingVertical: 14,
        marginTop: 12,
    },
    callButtonDisabled: {
        opacity: 0.6,
    },
    callButtonText: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 16,
        color: CREAM,
        letterSpacing: 0.3,
    },
    // Draft
    draftContent: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        gap: 4,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingVertical: 4,
        marginBottom: 20,
    },
    backChevron: {
        transform: [{ rotate: '90deg' }],
    },
    backLabel: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 14,
        color: BURGUNDY,
    },
    draftHeading: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 20,
        color: '#1a1a1a',
        marginBottom: 20,
    },
    draftTimeBlock: {
        marginBottom: 12,
    },
    draftTime: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 42,
        color: BURGUNDY,
        letterSpacing: -1,
        lineHeight: 46,
    },
    draftTz: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 13,
        color: BURGUNDY,
        marginTop: -4,
        marginBottom: 4,
    },
    draftDay: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 16,
        color: '#1a1a1a',
    },
    draftReason: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 13,
        color: 'rgba(0,0,0,0.5)',
        fontStyle: 'italic',
        lineHeight: 19,
        marginTop: 8,
        marginBottom: 8,
    },
    editTimeButton: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 4,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.12)',
    },
    editTimeText: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 15,
        color: '#1a1a1a',
    },
});
