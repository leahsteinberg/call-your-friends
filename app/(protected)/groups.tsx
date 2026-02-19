import { FullScreenStylingWrapper } from '@/features/Common/StylingWrapper';
import GroupsScreen from '@/features/Groups/GroupsScreen';
import { StyleSheet, View } from 'react-native';

export default function Groups() {
    return (
        <View style={styles.container}>
            <FullScreenStylingWrapper>
                <GroupsScreen />
            </FullScreenStylingWrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
