/**
 * Animation variants for the HeroSection component
 * These are predefined animation configurations for Framer Motion
 */

// Container animation with staggered children
export const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Subtle fade-in animation with slight upward movement
export const fadeIn = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1], // Cubic bezier for smooth easing
    },
  },
};

// Scale-in animation with fade effect
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

// Staggered items animation
export const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Staggered children configuration - for wrapping components with children
export const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Delayed staggered children - for elements that should animate after others
export const delayedStaggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};

// Alert animation for error messages
export const alertAnimation = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};