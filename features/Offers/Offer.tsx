import { useAcceptOfferMutation } from "@/services/offersApi";
import { CREAM, DARK_BEIGE, ORANGE } from "@/styles/styles";
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
    //   flex: 1,
    //   flexDirection: 'row',
    //   justifyContent: 'space-between',
    //   alignItems: 'center',
    //   paddingVertical: 5,
    //   paddingHorizontal: 5,
    //   marginVertical: 5,
    //   marginHorizontal: 10,
    //   borderRadius: 15,
    //   backgroundColor: CORNFLOWER_BLUE,
    },
    icon: {
      paddingRight: 10,
    },
    timeText: {
      color: ORANGE,
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
  });