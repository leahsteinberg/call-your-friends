import { CustomFonts } from '@/constants/theme';
import { BOLD_BLUE, CREAM } from '@/styles/styles';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { useAvatarContext } from './Avatar';

interface MiniAvatarProps {
    name?: string;
    avatarUrl?: string;
}

export function MiniAvatar({ name, avatarUrl }: MiniAvatarProps): React.JSX.Element {
    const { size } = useAvatarContext();
    const miniSize = Math.round(size * 0.5);
    const initial = name?.charAt(0).toUpperCase() ?? '?';

    return (
        <View
            style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                width: miniSize,
                height: miniSize,
                borderRadius: miniSize / 2,
                backgroundColor: CREAM,
                borderWidth: 1.5,
                borderColor: CREAM,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
            }}
        >
            {avatarUrl ? (
                <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: miniSize, height: miniSize, borderRadius: miniSize / 2 }}
                    contentFit="cover"
                    transition={200}
                />
            ) : (
                <Text style={{ fontSize: miniSize * 0.42, fontWeight: '600', color: BOLD_BLUE, fontFamily: CustomFonts.ztnaturebold }}>
                    {initial}
                </Text>
            )}
        </View>
    );
}
