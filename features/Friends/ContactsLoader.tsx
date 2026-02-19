import SmileyFace from "@/assets/images/smiley-face.svg";
import PulsingLoader from "@/components/LoadingAnimations/PulsingLoader";
import { BOLD_BLUE, BURGUNDY, PALE_BLUE } from "@/styles/styles";
import React from "react";

export default function ContactsLoader(): React.JSX.Element {
    const bubbleConfigs = [
        {
            SVG: SmileyFace,
            size: 100,
            color: BOLD_BLUE,
            position: { top: 10, left: 20 },
            scaleDuration: 1200,
            translateDuration: 1500,
            rotateDuration: 2000,
        },
        {
            SVG: SmileyFace,
            size: 80,
            color: BURGUNDY,
            position: { top: 15, right: 15 },
            scaleDuration: 1700,
            translateDuration: 1900,
            rotateDuration: 1800,
        },
        {
            SVG: SmileyFace,
            size: 65,
            color: PALE_BLUE,
            position: { bottom: 50, left: '65%' },
            scaleDuration: 1400,
            translateDuration: 2300,
            rotateDuration: 2200,
        },
    ];

    return <PulsingLoader bubbles={bubbleConfigs} containerSize={{ width: 200, height: 190 }} />;
}
