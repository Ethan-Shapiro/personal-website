export type AboutCategory = {
  number: string;
  label: string;
  // Exactly 3 slots per category. `null` renders as an "add photo" placeholder.
  photos: (string | null)[];
};

export const ABOUT_CATEGORIES: AboutCategory[] = [
  {
    number: "01",
    label: "Data Scientist",
    photos: ["/about/data-scientist-1.jpg", null, null],
  },
  {
    number: "02",
    label: "Sidequester",
    photos: [
      "/about/sidequester-1.jpg",
      "/about/sidequester-2.jpg",
      "/about/sidequester-3.jpg",
    ],
  },
  {
    number: "03",
    label: "Foodie / Matcha Luvr",
    photos: ["/about/foodie-1.jpg", "/about/foodie-2.jpg", "/about/foodie-3.jpg"],
  },
  {
    number: "04",
    label: "Fun-Haver",
    photos: [
      "/about/fun-haver-1.jpg",
      "/about/fun-haver-2.jpg",
      "/about/fun-haver-3.jpg",
    ],
  },
];
