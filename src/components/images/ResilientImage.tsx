"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function ResilientImage({ alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Image {...props} alt={alt} onError={() => setFailed(true)} />;
}
