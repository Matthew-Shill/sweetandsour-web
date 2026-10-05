import Image from "next/image";
import { ProductArt } from "@/components/art";
import type { Product } from "@/lib/types";

export function ProductPhoto({
  product,
  className = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: {
  product: Pick<Product, "name" | "image" | "art">;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-paper ${className}`}>
      {product.image ? (
        <Image
          src={product.image}
          alt=""
          fill
          priority={priority}
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <ProductArt art={product.art} />
      )}
    </div>
  );
}
