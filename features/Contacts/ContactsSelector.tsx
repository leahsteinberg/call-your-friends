import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { useCreateInviteMutation, useUserByPhoneMutation } from "@/services/contactsApi";
import { BURGUNDY, CORNFLOWER_BLUE, CREAM, ORANGE } from "@/styles/styles";
import * as Contacts from "expo-contacts";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import InvitePhoneNumber from "./InvitePhoneNumber";
import { addSentInvite } from "./contactsSlice";
import { cleanPhoneNumber, createSmsUrl, processContact } from "./contactsUtils";

// --- FAB Button ---

interface FabButtonProps {
    onPress: () => void;
}

function FabButton({ onPress }: FabButtonProps) {
    return (
        <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
            <IconSymbol name="plus" size={28} color={CREAM} />
        </TouchableOpacity>
    );
}

// --- Invite Menu ---

interface InviteMenuItemProps {
    icon: string;
    label: string;
    onPress: () => void;
    isLoading?: boolean;
}

function InviteMenuItem({ icon, label, onPress, isLoading = false }: InviteMenuItemProps) {
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.6}
            disabled={isLoading}
        >
            <View style={styles.menuIconContainer}>
                <IconSymbol name={icon as any} size={20} color={BURGUNDY} />
            </View>
            <Text style={styles.menuItemText}>{label}</Text>
            {isLoading && (
                <ActivityIndicator size="small" color={CORNFLOWER_BLUE} style={styles.menuItemSpinner} />
            )}
        </TouchableOpacity>
    );
}

interface InviteMenuProps {
    visible: boolean;
    onClose: () => void;
    onInviteContacts: () => void;
    onInviteByPhone: () => void;
    isInvitingContact: boolean;
}

function InviteMenu({ visible, onClose, onInviteContacts, onInviteByPhone, isInvitingContact }: InviteMenuProps) {
    const isMobile = Platform.OS !== "web";

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.menuOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.menuContainer}>
                            <View style={styles.menuHandle} />
                            <Text style={styles.menuTitle}>Add Friend</Text>

                            {isMobile && (
                                <InviteMenuItem
                                    icon="person.crop.rectangle.stack"
                                    label="Invite from Contacts"
                                    onPress={onInviteContacts}
                                    isLoading={isInvitingContact}
                                />
                            )}

                            <InviteMenuItem
                                icon="phone.fill"
                                label="Invite by Phone Number"
                                onPress={onInviteByPhone}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// --- Phone Number Modal ---

interface PhoneInviteModalProps {
    visible: boolean;
    onClose: () => void;
}

function PhoneInviteModal({ visible, onClose }: PhoneInviteModalProps) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.phoneModalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.phoneModalContainer}>
                            <View style={styles.phoneModalHeader}>
                                <View style={styles.menuHandle} />
                                <Text style={styles.phoneModalTitle}>Invite by Phone Number</Text>
                                <Text style={styles.phoneModalSubtitle}>
                                    Enter your friend's phone number to send them an invite.
                                </Text>
                            </View>

                            <View style={styles.phoneModalBody}>
                                <InvitePhoneNumber onSuccess={onClose} />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// --- Main Component ---

export default function ContactsSelector() {
    const dispatch = useDispatch();
    const userFromId: string = useSelector((state: RootState) => state.auth.user.id);

    const [createInvite] = useCreateInviteMutation();
    const [findUserByPhone] = useUserByPhoneMutation();

    const [showMenu, setShowMenu] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [isInvitingContact, setIsInvitingContact] = useState(false);

    // --- Contact invite flow (mobile only) ---

    const openSMSInvite = async (token: string, phoneNumber: string) => {
        const url = createSmsUrl(token, phoneNumber);
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "SMS is not available on this device.");
            }
        } catch {
            Alert.alert("Error", "Could not open SMS composer.");
        }
    };

    const selectContact = async (chosenContact: Contacts.Contact | null) => {
        if (!chosenContact) return;

        setIsInvitingContact(true);
        try {
            const friendUser = processContact(chosenContact);
            const userToPhoneNumber = cleanPhoneNumber(friendUser.digits);

            const response = await createInvite({ userFromId, userToPhoneNumber }).unwrap();
            if (response && userToPhoneNumber) {
                await findUserByPhone({ userPhoneNumber: userToPhoneNumber }).unwrap();
                dispatch(addSentInvite(friendUser));
                await openSMSInvite(response.token, userToPhoneNumber);
            }
        } catch {
            Alert.alert("Error", "Could not invite contact. Please try again.");
        } finally {
            setIsInvitingContact(false);
            setShowMenu(false);
        }
    };

    const handleInviteContacts = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const chosenContact = await Contacts.presentContactPickerAsync();
                await selectContact(chosenContact);
            }
        } catch {
            Alert.alert("Error", "Could not access contacts.");
            setIsInvitingContact(false);
        }
    };

    const handleInviteByPhone = () => {
        setShowMenu(false);
        setTimeout(() => setShowPhoneModal(true), 200);
    };

    return (
        <>
            <FabButton onPress={() => setShowMenu(true)} />

            <InviteMenu
                visible={showMenu}
                onClose={() => setShowMenu(false)}
                onInviteContacts={handleInviteContacts}
                onInviteByPhone={handleInviteByPhone}
                isInvitingContact={isInvitingContact}
            />

            <PhoneInviteModal
                visible={showPhoneModal}
                onClose={() => setShowPhoneModal(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    // FAB
    fab: {
        position: "absolute",
        bottom: 110,
        right: 20,
        backgroundColor: ORANGE,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },

    // Invite Menu
    menuOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    menuContainer: {
        backgroundColor: CREAM,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    menuHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        alignSelf: "center",
        marginBottom: 16,
    },
    menuTitle: {
        fontSize: 18,
        fontFamily: CustomFonts.ztnaturebold,
        color: BURGUNDY,
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(0, 0, 0, 0.08)",
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: CustomFonts.ztnaturemedium,
        color: BURGUNDY,
        flex: 1,
    },
    menuItemSpinner: {
        marginLeft: 8,
    },

    // Phone Number Modal
    phoneModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    phoneModalContainer: {
        backgroundColor: CREAM,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
        paddingTop: 12,
        minHeight: 280,
    },
    phoneModalHeader: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    phoneModalTitle: {
        fontSize: 18,
        fontFamily: CustomFonts.ztnaturebold,
        color: BURGUNDY,
        marginBottom: 6,
    },
    phoneModalSubtitle: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnatureregular,
        color: "rgba(57, 6, 23, 0.6)",
    },
    phoneModalBody: {
        paddingHorizontal: 24,
    },
});
