import { CustomFonts } from "@/constants/theme";
import { useCreateInviteMutation } from "@/services/contactsApi";
import { BURGUNDY, CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import PhoneNumberInput from "../Auth/PhoneNumberInput";
import { isPhoneNumberValid } from "../Contacts/contactsUtils";
import { addSentInvite } from "./contactsSlice";

interface InvitePhoneNumberProps {
    onSuccess?: () => void;
}

export default function InvitePhoneNumber({ onSuccess }: InvitePhoneNumberProps): React.JSX.Element {
    const [userToPhoneNumber, setPhoneNumber] = useState<string>("");
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);
    const [usePostCreateInvite] = useCreateInviteMutation();
    const dispatch = useDispatch();

    const [isSending, setIsSending] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const phoneNumberValid = isPhoneNumberValid(userToPhoneNumber);

    const sendInviteToPhoneNumber = async () => {
        setIsSending(true);
        setStatusMessage(null);

        try {
            const response = await usePostCreateInvite({ userFromId, userToPhoneNumber });
            if (response) {
                dispatch(addSentInvite(response.data));
                setPhoneNumber("");
                setStatusMessage({ text: "Invite sent!", isError: false });

                if (onSuccess) {
                    setTimeout(onSuccess, 800);
                }
            }
        } catch {
            setStatusMessage({ text: "Failed to send invite. Please try again.", isError: true });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <PhoneNumberInput
                onDataChange={setPhoneNumber}
                phoneNumber={userToPhoneNumber}
            />

            {statusMessage && (
                <Text style={[styles.statusText, statusMessage.isError && styles.statusError]}>
                    {statusMessage.text}
                </Text>
            )}

            <TouchableOpacity
                style={[styles.sendButton, !phoneNumberValid && styles.sendButtonDisabled]}
                onPress={sendInviteToPhoneNumber}
                disabled={!phoneNumberValid || isSending}
                activeOpacity={0.7}
            >
                {isSending ? (
                    <ActivityIndicator size="small" color={CREAM} />
                ) : (
                    <Text style={[styles.sendButtonText, !phoneNumberValid && styles.sendButtonTextDisabled]}>
                        Send Invite
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
    },
    statusText: {
        fontSize: 13,
        fontFamily: CustomFonts.ztnaturemedium,
        color: CORNFLOWER_BLUE,
        marginTop: 12,
        textAlign: "center",
    },
    statusError: {
        color: "#D32F2F",
    },
    sendButton: {
        backgroundColor: BURGUNDY,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 32,
        marginTop: 20,
        width: "100%",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "rgba(57, 6, 23, 0.2)",
    },
    sendButtonText: {
        fontSize: 16,
        fontFamily: CustomFonts.ztnaturebold,
        color: CREAM,
    },
    sendButtonTextDisabled: {
        color: "rgba(254, 251, 234, 0.6)",
    },
});
