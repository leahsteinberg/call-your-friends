import React from "react";
import PulsingSpeechBubblesLoader from "./PulsingSpeechBubblesLoader";

export enum LoaderType {
    SHIMMER_SKELETON = "shimmer_skeleton",
    PULSING_FLOWER = "pulsing_flower",
    ANIMATED_DOTS = "animated_dots",
    GLEAMING_CARD = "gleaming_card",
    PULSING_SPEECH_BUBBLES = "pulsing_speech_bubbles",
}

export default function TodayListLoader({ selectedLoader }: { selectedLoader: LoaderType | undefined }): React.JSX.Element {
    return <PulsingSpeechBubblesLoader />;
}
