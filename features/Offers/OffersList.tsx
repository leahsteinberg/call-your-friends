import { SectionList, Text, View } from "react-native";
import { OfferType } from "./types";

export default function OffersList({offers}) : React.JSX.Element {


    //const offers: OfferType[] = [{id: '1', offerState: 'PENDING'}, {id: '2', offerState: 'ACCEPTED'}, {id: '3', offerState: 'REJECTED'}];
    
    const sectionListData : SectionListData<OfferType, { title: string; data: OfferType[]; }>[] = [
        {
            title: "Offers",
            data: offers,
        }
    ]
    
    return (
        <View>
            <SectionList
                sections={sectionListData}
                keyExtractor={(item, index) => item.id + index}
                renderItem={({ item, index }: { item: OfferType; index: number }) =>
                    <Text>{item.id} {item.offerState}</Text>
                }
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={{ fontWeight: 'bold' }}>{title}</Text>
                )}
            />
        </View>
    )
}