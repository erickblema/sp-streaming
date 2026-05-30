"use client";

import Image from "next/image";
import { useState } from "react";

type TeamBadgeProps = {
  name: string;
  logo?: string;
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

function teamColor(name: string): string {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 42% 34%)`;
}

export function TeamBadge({
  name,
  logo,
  size = 28,
  className = "",
}: TeamBadgeProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !logo?.trim() || logo.includes("nologoo");

  if (showFallback) {
    return (
      <div
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white/90 ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(10, size * 0.32),
          backgroundColor: teamColor(name),
        }}
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
        src={logo!}
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
