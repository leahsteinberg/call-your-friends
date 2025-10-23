import { useGetOffersMutation } from "@/services/offersApi";
import { RootState } from "@/types/redux";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSelector } from "react-redux";
import OffersList from "./OffersList";

export default function Offers () : React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [getOffers] = useGetOffersMutation();
    const [offers, setOffers] = useState([])

    useEffect(async () => {
        handleGetOffers();

    }, []);


    const handleGetOffers = async () => {
        const offersResponse = await getOffers({ userId: 'uqE1jmBkAYpKrwqgaOD4RBWj9Am6TVW3'  });
        setOffers(offersResponse.data);
    }

    return (
        <View>
            <OffersList
                offers={offers}
            />
        </View>
    );


}