export type AboutCategory = {
  number: string;
  label: string;
  photoCount: number;
};

// 🚧 Placeholder photos — drop real ones in and wire them up per category.
export const ABOUT_CATEGORIES: AboutCategory[] = [
  { number: "01", label: "Data Scientist", photoCount: 3 },
  { number: "02", label: "Sidequester", photoCount: 3 },
  { number: "03", label: "Foodie / Matcha Luvr", photoCount: 3 },
  { number: "04", label: "Fun-Haver", photoCount: 3 },
];
