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
            {Array.from({ length: category.photoCount }).map((_, i) => (
              <PhotoPlaceholder key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
