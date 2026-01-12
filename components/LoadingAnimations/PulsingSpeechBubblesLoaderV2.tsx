import SpeechBubble1 from "@/assets/images/speech-bubble-1.svg";
import SpeechBubble2 from "@/assets/images/speech-bubble-2.svg";
import SpeechBubble3 from "@/assets/images/speech-bubble-3.svg";
import PulsingLoader from "@/components/LoadingAnimations/PulsingLoader";
import { BOLD_BLUE, BOLD_ORANGE, PALE_BLUE } from "@/styles/styles";
import React from "react";

const SCALE = 100;

export default function PulsingSpeechBubblesLoaderV2(): React.JSX.Element {
    const bubbleConfigs = [
        {
            SVG: SpeechBubble1,
            size: SCALE * 1,
            color: BOLD_BLUE,
            position: { top: 10, left: 20 },
            scaleDuration: 1200,
            translateDuration: 1500,
            rotateDuration: 2000,
        },
        {
            SVG: SpeechBubble2,
            size: SCALE * 0.80,
            color: BOLD_ORANGE,
            position: { top: 15, right: 15 },
            scaleDuration: 1700,
            translateDuration: 1900,
            rotateDuration: 1800,
        },
        {
            SVG: SpeechBubble3,
            size: SCALE * 0.65,
            color: PALE_BLUE,
            position: { bottom: 50, left: '65%' },
            scaleDuration: 1600,
            translateDuration: 2300,
            rotateDuration: 2200,
        },
    ];

    return <PulsingLoader bubbles={bubbleConfigs} containerSize={{ width: SCALE * 2, height: SCALE * 1.9 }} />;
}
