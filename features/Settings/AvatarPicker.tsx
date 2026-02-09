import { CustomFonts } from '@/constants/theme';
import { useUploadAvatarMutation } from '@/services/profileApi';
import { APP_HEADER_TEXT_COLOR, CREAM, CORNFLOWER_BLUE, BOLD_BLUE } from '@/styles/styles';
import { RootState } from '@/types/redux';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '@/features/Auth/authSlice';

export default function AvatarPicker(): React.JSX.Element {
    const dispatch = useDispatch();
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const existingAvatarUrl = useSelector((state: RootState) => state.auth.user.avatarUrl);
    const [avatarUri, setAvatarUri] = useState<string | null>(existingAvatarUrl ?? null);
    const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();

    const firstInitial = userName ? userName.charAt(0).toUpperCase() : '?';

    const pickImage = useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setAvatarUri(asset.uri);

            if (asset.base64) {
                const mimeType = asset.mimeType ?? 'image/jpeg';
                try {
                    const result = await uploadAvatar({
                        userId,
                        imageBase64: asset.base64,
                        mimeType,
                    }).unwrap();
                    if (result?.avatarUrl) {
                        dispatch(updateUser({ avatarUrl: result.avatarUrl }));
                    }
                } catch {
                    Alert.alert('Upload failed', 'Your photo was saved locally but could not be uploaded.');
                }
            }
        }
    }, [userId, uploadAvatar]);

    return (
        <View style={styles.container}>
            <Pressable onPress={pickImage} style={styles.avatarButton}>
                {avatarUri ? (
                    <Image
                        source={{ uri: avatarUri }}
                        style={styles.avatarImage}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.initialText}>{firstInitial}</Text>
                    </View>
                )}
                {isUploading && (
                    <View style={styles.uploadingOverlay}>
                        <ActivityIndicator color={CORNFLOWER_BLUE} />
                    </View>
                )}
            </Pressable>
            <View style={styles.textContainer}>
                <Pressable onPress={pickImage}>
                    <Text style={styles.tapText}>tap to add your photo or memoji</Text>
                </Pressable>
            </View>
        </View>
    );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    avatarButton: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        overflow: 'hidden',
    },
    avatarImage: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: CREAM,
        borderWidth: 2,
        borderColor: BOLD_BLUE,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialText: {
        fontSize: 30,
        fontFamily: CustomFonts.ztnaturebold,
        color: BOLD_BLUE,
    },
    textContainer: {
        marginTop: 10,
    },
    tapText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturelight,
        color: APP_HEADER_TEXT_COLOR,
        textAlign: 'center',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(254, 251, 234, 0.7)',
        borderRadius: AVATAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
