import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomFonts } from '@/constants/theme';
import {
    useDeleteMeetingPhotoMutation,
    useUpdateMeetingTextMutation,
    useUploadMeetingPhotoMutation,
} from '@/services/meetingApi';
import { BOLD_BROWN, CREAM } from '@/styles/styles';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface MeetingMediaSectionProps {
    meetingId: string;
    photoUrl?: string | null;
    textContent?: string | null;
    /** Color scheme: 'light' for light-bg cards, 'dark' for dark-bg cards */
    scheme?: 'light' | 'dark';
}

export default function MeetingMediaSection({
    meetingId,
    photoUrl,
    textContent,
    scheme = 'light',
}: MeetingMediaSectionProps): React.JSX.Element {
    const [uploadPhoto, { isLoading: isUploading }] = useUploadMeetingPhotoMutation();
    const [deletePhoto, { isLoading: isDeleting }] = useDeleteMeetingPhotoMutation();
    const [updateText] = useUpdateMeetingTextMutation();

    const [isEditingText, setIsEditingText] = useState(false);
    const [localText, setLocalText] = useState(textContent ?? '');
    const [isSavingText, setIsSavingText] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Sync localText when textContent prop changes (e.g. after refetch)
    useEffect(() => {
        if (!isEditingText) {
            setLocalText(textContent ?? '');
        }
    }, [textContent, isEditingText]);

    const textColor = scheme === 'dark' ? CREAM : BOLD_BROWN;
    const mutedColor = scheme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
    const separatorColor = scheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const inputBg = scheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    const hasPhoto = !!photoUrl;
    const hasText = !!(textContent && textContent.trim().length > 0);

    // Nothing to show and both are empty — still render add controls
    const showSection = true;

    const pickAndUploadPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
            exif: false,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
                const mimeType = asset.mimeType ?? 'image/jpeg';
                try {
                    await uploadPhoto({ meetingId, imageBase64: asset.base64, mimeType }).unwrap();
                } catch {
                    Alert.alert('Upload failed', 'Could not upload the photo. Please try again.');
                }
            }
        }
    };

    const handlePhotoPress = () => {
        if (hasPhoto) {
            Alert.alert('Meeting photo', 'What would you like to do?', [
                { text: 'Change photo', onPress: pickAndUploadPhoto },
                {
                    text: 'Remove photo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePhoto({ meetingId }).unwrap();
                        } catch {
                            Alert.alert('Error', 'Could not remove the photo.');
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]);
        } else {
            pickAndUploadPhoto();
        }
    };

    const handleTextPress = () => {
        setIsEditingText(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleSaveText = async () => {
        const trimmed = localText.trim();
        setIsSavingText(true);
        try {
            await updateText({ meetingId, textContent: trimmed.length > 0 ? trimmed : null }).unwrap();
        } catch {
            Alert.alert('Error', 'Could not save the note.');
        } finally {
            setIsSavingText(false);
            setIsEditingText(false);
        }
    };

    const handleCancelText = () => {
        setLocalText(textContent ?? '');
        setIsEditingText(false);
    };

    return (
        <View style={[styles.container, { borderTopColor: separatorColor }]}>
            {/* Photo section */}
            {(isUploading || isDeleting) ? (
                <View style={styles.photoLoading}>
                    <ActivityIndicator size="small" color={textColor} />
                </View>
            ) : hasPhoto ? (
                <Pressable onPress={handlePhotoPress} style={styles.photoWrapper}>
                    <Image
                        source={{ uri: photoUrl! }}
                        style={styles.photo}
                        contentFit="cover"
                        transition={200}
                    />
                    <View style={styles.photoEditBadge}>
                        <IconSymbol
                            name="circle-ellipsis"
                            fill="transparent"
                        />
                        <Text style={styles.photoEditBadgeText}>edit</Text>
                    </View>
                </Pressable>
            ) : (
                <Pressable onPress={handlePhotoPress} style={styles.addPhotoRow}>
                    <Text style={[styles.addPhotoText, { color: mutedColor }]}>+ add photo</Text>
                </Pressable>
            )}

            {/* Text / note section */}
            {isEditingText ? (
                <View style={[styles.textInputWrapper, { backgroundColor: inputBg }]}>
                    <TextInput
                        ref={inputRef}
                        value={localText}
                        onChangeText={setLocalText}
                        placeholder="Add a note…"
                        placeholderTextColor={mutedColor}
                        multiline
                        style={[styles.textInput, { color: textColor }]}
                        returnKeyType="done"
                        blurOnSubmit
                        onSubmitEditing={handleSaveText}
                    />
                    <View style={styles.textActions}>
                        <Pressable onPress={handleCancelText} style={styles.textActionBtn}>
                            <Text style={[styles.textActionLabel, { color: mutedColor }]}>cancel</Text>
                        </Pressable>
                        <Pressable onPress={handleSaveText} disabled={isSavingText} style={styles.textActionBtn}>
                            {isSavingText ? (
                                <ActivityIndicator size="small" color={textColor} />
                            ) : (
                                <Text style={[styles.textActionLabel, { color: textColor, fontFamily: CustomFonts.ztnaturemedium }]}>save</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            ) : hasText ? (
                <Pressable onPress={handleTextPress} style={styles.textDisplayRow}>
                    <Text style={[styles.textDisplay, { color: textColor }]} numberOfLines={3}>
                        {textContent}
                    </Text>
                    <IconSymbol
                        name="pencil"
                        fill="transparent"
                    />
                    <Text style={[styles.editHint, { color: mutedColor }]}>edit</Text>
                </Pressable>
            ) : (
                <Pressable onPress={handleTextPress} style={styles.addPhotoRow}>
                    <Text style={[styles.addPhotoText, { color: mutedColor }]}>+ add note</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 8,
    },
    photoWrapper: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: 140,
        borderRadius: 10,
    },
    photoEditBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    photoLoading: {
        height: 140,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    addPhotoRow: {
        paddingVertical: 4,
    },
    addPhotoText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
    },
    textDisplayRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    textDisplay: {
        flex: 1,
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        lineHeight: 20,
    },
    editHint: {
        fontSize: 12,
        fontFamily: CustomFonts.ztnatureregular,
        marginTop: 2,
    },
    textInputWrapper: {
        borderRadius: 10,
        padding: 10,
    },
    textInput: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        lineHeight: 20,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    textActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 6,
    },
    textActionBtn: {
        paddingVertical: 4,
    },
    textActionLabel: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnatureregular,
    },
});
