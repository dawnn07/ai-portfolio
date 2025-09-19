"use client";

import { useEffect, useState } from "react";

export function Clock() {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            setCurrentTime(now.toLocaleDateString('en-US', options));
        };

        // Update time immediately
        updateTime();
        
        // Update time every second
        const interval = setInterval(updateTime, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-shrink-0 text-foreground text-sm font-medium">
            {currentTime}
        </div>
    );
}