"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

export function LocalTime() {
  const [time, setTime] = useState<{ h: string; m: string } | null>(null);

  useEffect(() => {
    function update() {
      const parts = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: site.timezone,
      }).formatToParts(new Date());
      setTime({
        h: parts.find((p) => p.type === "hour")?.value ?? "--",
        m: parts.find((p) => p.type === "minute")?.value ?? "--",
      });
    }
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] tracking-[0.12em] text-faint">
      lahore&nbsp;—&nbsp;
      {time ? (
        <>
          {time.h}
          <span className="clock-colon">:</span>
          {time.m}&nbsp;pkt
        </>
      ) : (
        <span className="opacity-0">00:00 pkt</span>
      )}
    </span>
  );
}
