import { useAcceptOfferMutation, useRejectOfferMutation } from "@/services/offersApi";
import { BRIGHT_BLUE, BRIGHT_GREEN, CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { Check, X } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";


export default function Offer({ offer }) {
    console.log("offer is", offer);
    const offerId = offer.id
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptOffer] = useAcceptOfferMutation();
    const [rejectOffer] = useRejectOfferMutation();

    const iconSize: number = 24;

    const handleAcceptOffer = async () => {
        const acceptedOffer = await acceptOffer({ userId, offerId });
        console.log("Accepted Offer", acceptedOffer)
    }

    const handleRejectOffer = async () => {
        const rejectedOffer = await rejectOffer({ userId, offerId });
        console.log("Rejected Offer", rejectedOffer)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.timeText}>{offer.displayScheduledFor}</Text>
            <Text style={styles.nameText}>from: {offer.meeting.userFrom.name}</Text>
            {offer.offerState === 'OPEN' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleAcceptOffer}
                        style={styles.acceptButton}
                    >
                        <Check color={BRIGHT_GREEN} size={iconSize}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleRejectOffer}
                        style={styles.rejectButton}
                    >
                        <X color="red" size={iconSize}/>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 15,
        backgroundColor: CREAM,
        borderWidth: 2,
        borderColor: DARK_BEIGE,
    },
    timeText: {
        color: BRIGHT_BLUE,
        fontWeight: 900,
        flexGrow: 1,
        paddingVertical: 10,
        paddingLeft: 5,
    },
    nameText: {
        color: ORANGE,
        fontWeight: 900,
        flexGrow: 1,
        paddingVertical: 10,
        paddingLeft: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 10,
    },
    acceptButton: {
        padding: 8,
    },
    rejectButton: {
        padding: 8,
    },
});