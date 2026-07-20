"use client";

import Image from "next/image";

import logoImg from "../public/logo.png";

interface RecallifyLogoProps {
  /** Width in pixels (height scales proportionally) */
  size?: number;
  className?: string;
}

/**
 * Recallify brand logo image.
 * Used across navbar, footer, auth pages, and landing sections.
 */
export default function RecallifyLogo({ size = 32, className = "mix-blend-multiply" }: RecallifyLogoProps) {
  return (
    <Image
      src={logoImg}
      alt="Recallify"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
