import { CREAM } from '@/styles/styles';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FOLDER_WIDTH = Math.round(SCREEN_WIDTH * 0.3);
const TAB_HEIGHT = 16;
const FOLDER_BODY_HEIGHT = 80;
const FOLDER_HEIGHT = TAB_HEIGHT + FOLDER_BODY_HEIGHT;
const TAB_WIDTH = Math.round(FOLDER_WIDTH * 0.45);
const FOLDER_R = 10; // corner radius
const INNER_R = 6;   // inner concave corner where body meets tab

function buildFolderPath() {
    const W = FOLDER_WIDTH;
    const H = FOLDER_HEIGHT;
    const TH = TAB_HEIGHT;
    const TW = TAB_WIDTH;
    const R = FOLDER_R;
    const IR = INNER_R;

    return [
        // Start at top-left of body (after corner)
        `M ${R} ${TH}`,
        // Across body top to where tab begins
        `L ${W - TW - IR} ${TH}`,
        // Concave inner corner curving up into tab
        `Q ${W - TW} ${TH} ${W - TW} ${TH - IR}`,
        // Up the left edge of the tab
        `L ${W - TW} ${R}`,
        // Tab top-left corner
        `Q ${W - TW} 0 ${W - TW + R} 0`,
        // Across tab top
        `L ${W - R} 0`,
        // Tab top-right corner
        `Q ${W} 0 ${W} ${R}`,
        // Down right edge (shared by tab and body)
        `L ${W} ${H - R}`,
        // Bottom-right corner
        `Q ${W} ${H} ${W - R} ${H}`,
        // Across bottom
        `L ${R} ${H}`,
        // Bottom-left corner
        `Q 0 ${H} 0 ${H - R}`,
        // Up left edge
        `L 0 ${TH + R}`,
        // Top-left corner of body
        `Q 0 ${TH} ${R} ${TH}`,
        'Z',
    ].join(' ');
}

const FOLDER_PATH = buildFolderPath();

interface FolderTabProps {
    children?: React.ReactNode;
    fillColor?: string;
}

export default function FolderTab({
    children,
    fillColor = CREAM,
}: FolderTabProps): React.JSX.Element {
    return (
        <View style={styles.container}>
            <Svg
                width={FOLDER_WIDTH}
                height={FOLDER_HEIGHT}
                style={styles.folderBackground}
            >
                <Path d={FOLDER_PATH} fill={fillColor} />
            </Svg>
            <View style={styles.folderContent}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: FOLDER_WIDTH,
        height: FOLDER_HEIGHT,
    },
    folderBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    folderContent: {
        flex: 1,
        paddingTop: TAB_HEIGHT + 4,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
