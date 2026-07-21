import Image from "next/image";
import { ABOUT_CATEGORIES } from "@/lib/about-gallery";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

export function AboutGallery() {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-14 lg:grid-cols-2">
      {ABOUT_CATEGORIES.map((category) => (
        <div key={category.number}>
          <h3 className="font-mono text-sm tracking-wide text-muted">
            {category.number}. {category.label.toUpperCase()}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {category.photos.map((src, i) =>
              src ? (
                <div
                  key={i}
                  className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={src}
                    alt={`${category.label} photo ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 260px, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <PhotoPlaceholder key={i} />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
