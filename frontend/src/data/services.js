// src/data/services.js
import { Home, Sparkles, Scan, DoorOpen } from "lucide-react";

export const SERVICES = {
  HOME: {
    id: "home-cleaning",
    icon: Home,
    title: "Home Cleaning",
    description: "Comprehensive cleaning for your entire home",
    price: 79.99,
    duration: "2–3 hours",
    isPopular: true,
    features: [
      "Thorough room‑by‑room cleaning",
      "Dust and wipe all surfaces",
      "Vacuum and mop floors",
      "Clean bathrooms and kitchen",
    ],
    category: "Residential",
    rating: "4.9",
  },

  DEEP: {
    id: "deep-cleaning",
    icon: Sparkles,
    title: "Deep Cleaning",
    description: "Intensive cleaning for a complete refresh",
    price: 129.99,
    duration: "4–5 hours",
    features: [
      "All Home Cleaning services",
      "Deep clean of hard‑to‑reach areas",
      "Detailed appliance cleaning",
      "Carpet and upholstery spot cleaning",
    ],
    category: "Residential",
    rating: "4.8",
  },

  WINDOW: {
    id: "window-cleaning",
    icon: Scan,
    title: "Window Cleaning",
    description: "Professional window and glass surface cleaning",
    price: 59.99,
    duration: "1–2 hours",
    features: [
      "Interior and exterior window cleaning",
      "Streak‑free guarantee",
      "Sill and frame cleaning",
      "Glass door and mirror cleaning",
    ],
    category: "Specialty",
    rating: "4.7",
  },

  MOVE: {
    id: "move-cleaning",
    icon: DoorOpen,
    title: "Move‑in/Move‑out Cleaning",
    description: "Comprehensive cleaning for property transitions",
    price: 199.99,
    duration: "5–7 hours",
    features: [
      "Full home deep cleaning",
      "Appliance and fixture detailing",
      "Wall and baseboard cleaning",
      "Carpet and floor preparation",
    ],
    category: "Specialty",
    rating: "4.9",
  },
};

export const serviceList = Object.values(SERVICES);
