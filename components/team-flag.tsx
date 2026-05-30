"use client";

import Image from "next/image";
import { useState } from "react";

type TeamFlagProps = {
  name: string;
  flag: string;
  size?: number;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function TeamFlag({
  name,
  flag,
  size = 28,
  className = "",
}: TeamFlagProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !flag?.trim();

  if (showFallback) {
    return (
      <div
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-full bg-zinc-700 font-bold text-zinc-300 ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
      >
        {getInitials(name) || "?"}
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-zinc-800 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={flag}
        alt=""
        fill
        className="object-cover"
        sizes={`${size}px`}
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
