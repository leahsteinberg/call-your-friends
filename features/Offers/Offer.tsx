import { useAcceptOfferMutation } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";


export default function Offer({ offer }) {
    console.log("offer is", offer);
    const offerId = offer.id
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [acceptOffer] = useAcceptOfferMutation();


    const handleAcceptOffer = async () => {
        const acceptedOffer = await acceptOffer({ userId, offerId });
        console.log("Accepted Offer", acceptedOffer)
    }

    return (
        <View style={styles.container}>
            <Text>offer-{offer.id.slice(0, 8)}</Text>
            <Text>meeting-{offer.meeting.id.slice(0,8)}</Text>
            {offer.offerState === 'OPEN' && 
                <TouchableOpacity
                    onPress={handleAcceptOffer}
                    style={styles.acceptButton}
                >
                    <Text>ACCEPT OFFER</Text>
                </TouchableOpacity>
            }
            <Text>{offer.offerState}</Text>
            
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        margin: 5,
        gap: 5,
        justifyContent: 'space-between'

    },
    acceptButton: {
        borderColor: 'black',
        borderWidth: 1,
    }
})