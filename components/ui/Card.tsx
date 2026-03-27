"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  const paddings = { sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div
      className={`bg-white rounded-3xl border border-zinc-100 shadow-sm ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
