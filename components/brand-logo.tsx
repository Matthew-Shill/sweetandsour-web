import Image from "next/image";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Sweet and Sour"
      width={512}
      height={512}
      priority
      className={className}
    />
  );
}
