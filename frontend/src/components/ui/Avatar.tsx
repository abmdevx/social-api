import type { ImgHTMLAttributes } from "react";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-16 text-xl" };

export function Avatar({ name = "User", size = "md", src, className = "", ...props }: AvatarProps) {
  const initials = name.trim().slice(0, 2).toUpperCase();
  return src ? (
    <img src={src} alt={`${name} avatar`} className={`rounded-full object-cover ${sizes[size]} ${className}`} {...props} />
  ) : (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-cyan-400/15 font-semibold text-cyan-300 ${sizes[size]} ${className}`} aria-label={`${name} avatar`}>
      {initials}
    </span>
  );
}
