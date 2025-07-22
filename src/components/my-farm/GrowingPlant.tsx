
'use client';

import React, { useEffect } from 'react';
import { DotLottieReact, useDotLottie } from '@lottiefiles/dotlottie-react';

interface GrowingPlantProps {
  progress: number; // 0-100
}

export default function GrowingPlant({ progress }: GrowingPlantProps) {
    const { lottie, dotLottie, isLoaded } = useDotLottie({
        src: "https://lottie.host/4f57ddb4-3081-4b9f-a7fb-2c671b101a0d/m4bER1Qo8k.lottie",
        autoplay: false,
        loop: false,
    });

    useEffect(() => {
        if (isLoaded && lottie) {
            const totalFrames = dotLottie?.manifest.animations[0].tfs ?? 300;
            const frameToSeek = Math.floor((progress / 100) * (totalFrames - 1));
            lottie.seek(frameToSeek);
        }
    }, [progress, isLoaded, lottie, dotLottie]);

    return (
        <div className="flex flex-col items-center justify-end h-32 w-full">
            <DotLottieReact
                lottieRef={lottie}
                className="h-full w-auto"
            />
        </div>
    );
}
