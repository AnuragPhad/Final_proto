
'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface GrowingPlantProps {
  progress: number; // 0-100 - This prop is kept for potential future use, but not currently used for animation control.
}

export default function GrowingPlant({ progress }: GrowingPlantProps) {
    return (
        <div className="flex flex-col items-center justify-end h-32 w-full">
            <DotLottieReact
                src="https://lottie.host/4f57ddb4-3081-4b9f-a7fb-2c671b101a0d/m4bER1Qo8k.lottie"
                loop
                autoplay
                className="h-full w-auto"
            />
        </div>
    );
}
