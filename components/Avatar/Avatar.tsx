import { CustomFonts } from "@/constants/theme";
import { BOLD_BLUE, CREAM } from "@/styles/styles";
import { Image } from "expo-image";
import React, { createContext, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Greyscale } from "./AvatarGreyscale";
import { MiniAvatar } from "./AvatarMini";
import { GradientRing, PulseRing, TimerRing } from "./AvatarRing";
import { SpeechBubble } from "./AvatarSpeechBubble";

// ============================================
// CONTEXT
// ============================================
interface AvatarContextType {
    size: number;
}

export const AvatarContext = createContext<AvatarContextType>({ size: 48 });

export function useAvatarContext() {
    return useContext(AvatarContext);
}

// ============================================
// BASE AVATAR
// ============================================
interface AvatarProps {
    name?: string;
    avatarUrl?: string;
    size?: number;
    children?: React.ReactNode;
    borderColor?: string;
    borderWidth?: number;
    contentPosition?: string;
}

function AvatarComponent({ name, avatarUrl, size = 48, children, borderColor, borderWidth, contentPosition }: AvatarProps): React.JSX.Element {
    const initial = name?.charAt(0).toUpperCase() ?? '?';
    const hasBorder = borderColor !== undefined && borderWidth !== undefined && borderWidth > 0;

    return (
        <AvatarContext.Provider value={{ size }}>
            <View style={{ alignItems: 'center' }}>
                <View
                    style={[
                        styles.circle,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            ...(hasBorder && { borderWidth, borderColor }),
                        },
                    ]}
                >
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={{ width: size, height: size, borderRadius: size / 2 }}
                            contentFit="cover"
                            contentPosition={contentPosition || "center"}
                            transition={200}
                        />
                    ) : (
                        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
                    )}
                </View>
                {children}
                <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.name, { fontSize: size < 20 ? size * 0.28 : size * 0.30, maxWidth: size * 2 }]}
                >{name}</Text>
            </View>
        </AvatarContext.Provider>
    );
}

// ============================================
// COMPOSE & EXPORT
// ============================================
const Avatar = Object.assign(AvatarComponent, {
    TimerRing,
    GradientRing,
    PulseRing,
    Greyscale,
    MiniAvatar,
    SpeechBubble,
});

export default Avatar;

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    circle: {
        backgroundColor: CREAM,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    name: {
        fontFamily: CustomFonts.ztnaturebold,
        color: 'black',
        textAlign: 'center',
        marginTop: 2,
        marginHorizontal: 5,
    },
    initial: {
        fontWeight: '600',
        color: BOLD_BLUE,
        fontFamily: CustomFonts.ztnaturebold,
    },
});
