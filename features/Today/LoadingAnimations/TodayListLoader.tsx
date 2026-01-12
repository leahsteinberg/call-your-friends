import React from "react";
import AnimatedDotsLoader from "./AnimatedDotsLoader";
import GleamingCardLoader from "./GleamingCardLoader";
import PulsingFlowerLoader from "./PulsingFlowerLoader";
import ShimmerSkeletonLoader from "./ShimmerSkeletonLoader";

export enum LoaderType {
    SHIMMER_SKELETON = "shimmer_skeleton",
    PULSING_FLOWER = "pulsing_flower",
    ANIMATED_DOTS = "animated_dots",
    GLEAMING_CARD = "gleaming_card",
}

export default function TodayListLoader({ selectedLoader }: { selectedLoader: LoaderType | undefined }): React.JSX.Element {
    if (!selectedLoader) {
        return <ShimmerSkeletonLoader />;
    }

    switch (selectedLoader) {
        case LoaderType.SHIMMER_SKELETON:
            return <ShimmerSkeletonLoader />;
        case LoaderType.PULSING_FLOWER:
            return <PulsingFlowerLoader />;
        case LoaderType.ANIMATED_DOTS:
            return <AnimatedDotsLoader />;
        case LoaderType.GLEAMING_CARD:
            return <GleamingCardLoader />;
        default:
            return <ShimmerSkeletonLoader />;
    }
}
