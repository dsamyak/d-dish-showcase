export type DishVariant = {
  name: string;
  description: string;
  price: string;
  // food color for the main shape
  color: string;
  accent: string;
};

export type DishCategory = {
  id: string;
  category: string;
  tagline: string;
  // shape preset for the 3D render
  shape: "curry" | "tikka" | "rice" | "dosa" | "dessert";
  variants: DishVariant[];
};

export const MENU: DishCategory[] = [
  {
    id: "paneer",
    category: "Paneer",
    tagline: "Cottage cheese, five ways",
    shape: "curry",
    variants: [
      { name: "Paneer Butter Masala", description: "Creamy tomato gravy, fenugreek finish", price: "₹320", color: "#e86a3a", accent: "#fff4e6" },
      { name: "Kadhai Paneer", description: "Bell peppers, crushed coriander seeds", price: "₹310", color: "#c64a2a", accent: "#ffd9a8" },
      { name: "Palak Paneer", description: "Silky spinach, garlic tempering", price: "₹300", color: "#2f6b3a", accent: "#e8f3d6" },
      { name: "Shahi Paneer", description: "Cashew cream, saffron, royal spice", price: "₹340", color: "#e8a04a", accent: "#fff1c8" },
      { name: "Paneer Tikka Masala", description: "Charred cubes in smoky gravy", price: "₹330", color: "#b8401e", accent: "#ffd0a8" },
    ],
  },
  {
    id: "chicken",
    category: "Chicken",
    tagline: "From the tandoor and the pot",
    shape: "tikka",
    variants: [
      { name: "Butter Chicken", description: "Slow-simmered tomato, butter, cream", price: "₹420", color: "#d8541a", accent: "#fff0d6" },
      { name: "Chicken Tikka", description: "Yogurt marinated, clay oven charred", price: "₹380", color: "#a8321a", accent: "#ffc89a" },
      { name: "Chicken Chettinad", description: "Black pepper, curry leaf, coconut", price: "₹400", color: "#5a2818", accent: "#e8a878" },
      { name: "Methi Murgh", description: "Fresh fenugreek, ginger, green chili", price: "₹390", color: "#3a5a2a", accent: "#d0e8a8" },
    ],
  },
  {
    id: "rice",
    category: "Rice",
    tagline: "Long grain, dum cooked",
    shape: "rice",
    variants: [
      { name: "Hyderabadi Biryani", description: "Saffron rice, slow dum, mint", price: "₹360", color: "#f4d27a", accent: "#a8421a" },
      { name: "Veg Pulao", description: "Whole spices, garden vegetables", price: "₹240", color: "#f0e6c8", accent: "#5a8a4a" },
      { name: "Jeera Rice", description: "Cumin tempered basmati", price: "₹180", color: "#f8f0d8", accent: "#8a5a2a" },
    ],
  },
  {
    id: "dosa",
    category: "Dosa",
    tagline: "Crisp from the iron griddle",
    shape: "dosa",
    variants: [
      { name: "Masala Dosa", description: "Spiced potato, coconut chutney", price: "₹160", color: "#d8a45a", accent: "#f4e8c8" },
      { name: "Mysore Dosa", description: "Red chili chutney layer", price: "₹180", color: "#a8401a", accent: "#f4d8a8" },
      { name: "Paper Dosa", description: "Three feet long, crackling thin", price: "₹150", color: "#e8c48a", accent: "#fff4d8" },
      { name: "Rava Dosa", description: "Lacy semolina, onion, cumin", price: "₹170", color: "#c89858", accent: "#f4e0b8" },
    ],
  },
  {
    id: "dessert",
    category: "Dessert",
    tagline: "Sweet endings",
    shape: "dessert",
    variants: [
      { name: "Gulab Jamun", description: "Rose-cardamom syrup, warm", price: "₹140", color: "#7a3a18", accent: "#f4c878" },
      { name: "Rasmalai", description: "Saffron milk, pistachio crumb", price: "₹160", color: "#f4e8c8", accent: "#d8a83a" },
      { name: "Kulfi", description: "Slow-reduced milk, cardamom", price: "₹130", color: "#f8f0d8", accent: "#8a5a2a" },
    ],
  },
];
