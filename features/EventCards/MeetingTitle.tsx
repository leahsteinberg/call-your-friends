import KeyboardFloating from '@/components/Inputs/KeyboardFloating';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomFonts } from '@/constants/theme';
import { useUpdateMeetingMetaMutation } from '@/services/meetingApi';
import { BURGUNDY, CREAM } from '@/styles/styles';
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface MeetingTitleProps {
    meetingId: string;
    title: string;
    editable?: boolean;
    scheme?: 'light' | 'dark';
}

export default function MeetingTitle({
    meetingId,
    title,
    editable = true,
    scheme = 'light',
}: MeetingTitleProps): React.JSX.Element {
    const [updateMeta] = useUpdateMeetingMetaMutation();
    const [localTitle, setLocalTitle] = useState(title);
    const [isPending, setIsPending] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (!isPending) {
            setLocalTitle(title);
        }
    }, [title, isPending]);

    const textColor = scheme === 'dark' ? CREAM : '#262626';
    const mutedColor = scheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)';
    const hasTitle = localTitle.trim().length > 0;

    const handlePencilPress = () => {
        setInputValue(localTitle);
        setIsEditing(true);
    };

    const handleSave = async () => {
        const newTitle = inputValue.trim();
        setIsEditing(false);
        if (newTitle === localTitle) return;

        const committed = localTitle;
        setLocalTitle(newTitle);
        setIsPending(true);
        try {
            const result = await updateMeta({ meetingId, title: newTitle }).unwrap();
            if (result.title !== undefined) {
                setLocalTitle(result.title);
            }
        } catch {
            setLocalTitle(committed);
        } finally {
            setIsPending(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                {hasTitle ? (
                    <Text
                        style={[styles.title, { color: textColor, opacity: isPending ? 0.5 : 1 }]}
                        numberOfLines={2}
                    >
                        {localTitle}
                    </Text>
                ) : editable ? (
                    <Text style={[styles.placeholder, { color: mutedColor }]}>
                        Add a title…
                    </Text>
                ) : null}
                {editable && (
                    <TouchableOpacity
                        onPress={handlePencilPress}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.pencilButton}
                    >
                        <IconSymbol name="pencil" size={11} color={mutedColor} />
                    </TouchableOpacity>
                )}
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={isEditing}
                onRequestClose={handleCancel}
            >
                <Pressable style={styles.overlay} onPress={handleCancel}>
                    <KeyboardFloating defaultBottom={0} keyboardGap={0}>
                        <Pressable onPress={e => e.stopPropagation()}>
                            <View style={styles.inputPanel}>
                                <View style={styles.inputActions}>
                                    <TouchableOpacity onPress={handleCancel}>
                                        <Text style={styles.cancelLabel}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSave}>
                                        <Text style={styles.doneLabel}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    ref={inputRef}
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    placeholder="Add a title…"
                                    placeholderTextColor="rgba(0,0,0,0.3)"
                                    style={styles.input}
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={handleSave}
                                    multiline={false}
                                />
                            </View>
                        </Pressable>
                    </KeyboardFloating>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
    },
    title: {
        flex: 1,
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        lineHeight: 20,
    },
    placeholder: {
        flex: 1,
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        fontStyle: 'italic',
    },
    pencilButton: {
        marginBottom: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    inputPanel: {
        backgroundColor: CREAM,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 20,
        gap: 10,
    },
    inputActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cancelLabel: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnatureregular,
        color: 'rgba(0,0,0,0.45)',
    },
    doneLabel: {
        fontSize: 15,
        fontFamily: CustomFonts.ztnaturebold,
        color: BURGUNDY,
    },
    input: {
        fontSize: 16,
        fontFamily: CustomFonts.ztnatureregular,
        color: '#1a1a1a',
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.15)',
    },
});
