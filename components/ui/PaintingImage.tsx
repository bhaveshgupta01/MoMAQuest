"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

type PaintingImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | undefined | null;
};

export function PaintingImage({ src, alt, className, ...props }: PaintingImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Image
        src="/painting-fallback.svg"
        alt={alt}
        className={className}
        {...props}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
      unoptimized
    />
  );
}
