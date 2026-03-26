import { useEffect, useState } from "react";

import { COUNT_UP_ANIMATION } from "@/shared/constants/app";

export function useCountUpValue(value: number) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startValue = 0;
        const steps = COUNT_UP_ANIMATION.STEPS;
        const increment = value / steps;

        const interval = window.setInterval(() => {
            startValue += increment;

            if (startValue >= value) {
                setDisplayValue(value);
                window.clearInterval(interval);
                return;
            }

            setDisplayValue(Math.round(startValue));
        }, COUNT_UP_ANIMATION.INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [value]);

    return displayValue;
}
