// Basic Fade Animations
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Container Animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const staggerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Scale Animations
export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const scaleInHover = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Advanced Animations
export const slideInFromBottom = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200
    }
  }
};

export const popIn = {
  hidden: { 
    scale: 0,
    opacity: 0,
    rotate: -180
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      duration: 0.6,
      bounce: 0.5
    }
  }
};

// List Item Animations
export const listItem = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  hover: {
    x: 5,
    transition: { duration: 0.2 }
  }
};

// Card Animations
export const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Button Animations
export const buttonTap = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Notification Animations
export const toastAnimation = {
  hidden: { opacity: 0, y: 50, scale: 0.3 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.4,
      bounce: 0.3
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 }
  }
};

// Utility function to create custom stagger containers
export const createStaggerContainer = (staggerTime = 0.2, delayTime = 0.3) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerTime,
      delayChildren: delayTime,
    },
  },
});

// Page transition animations
export const pageTransition = {
  hidden: {
    opacity: 0,
    x: -200,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 200,
    transition: {
      duration: 0.5,
      ease: "easeIn",
    },
  },
};

// ========= NEW CLEANING-SPECIFIC ANIMATIONS =========

// Clean sweep animation (for transitions between sections or steps)
export const cleanSweep = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.8, ease: "easeInOut" }
  },
  exit: {
    clipPath: "inset(0 0 0 100%)",
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

// Sparkle effect (for highlighting special features or completed tasks)
export const sparkleEffect = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: [0, 1, 0.8, 1],
    scale: [0, 1.2, 0.9, 1],
    rotate: [0, 15, -5, 0],
    transition: { 
      duration: 0.7,
      times: [0, 0.3, 0.6, 1],
      ease: "easeOut"
    }
  }
};

// Rating stars animation
export const ratingStarAnimation = {
  hidden: { scale: 0, opacity: 0 },
  visible: (custom) => ({
    scale: 1,
    opacity: 1,
    transition: { 
      delay: custom * 0.1,
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }),
  selected: { 
    scale: [1, 1.3, 1], 
    color: "#FFD700", 
    transition: { duration: 0.3 } 
  }
};

// Progress step animation (for booking flow)
export const progressStepAnimation = {
  inactive: { 
    backgroundColor: "#E2E8F0",
    borderColor: "#E2E8F0",
    scale: 1 
  },
  active: {
    backgroundColor: "#4FD1C5",
    borderColor: "#4FD1C5",
    scale: 1.1,
    boxShadow: "0 0 0 4px rgba(79, 209, 197, 0.3)",
    transition: { duration: 0.3 }
  },
  completed: {
    backgroundColor: "#38B2AC",
    borderColor: "#38B2AC",
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// Confetti celebration (for successful booking)
export const successConfetti = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  }
};

// Individual confetti piece
export const confettiPiece = {
  hidden: { opacity: 0, y: 0, x: 0 },
  visible: (custom) => ({
    opacity: [1, 1, 0],
    y: [0, custom.y],
    x: [0, custom.x],
    rotate: [0, custom.rotate],
    transition: { 
      duration: 2,
      times: [0, 0.7, 1],
      ease: "easeOut"
    }
  })
};

// Before/After slider animation
export const beforeAfterReveal = {
  initial: { clipPath: "inset(0 50% 0 0)" },
  hover: { 
    clipPath: "inset(0 0% 0 0)", 
    transition: { duration: 1, ease: "easeInOut" } 
  }
};

// Pulse animation for call-to-actions
export const pulseCTA = {
  initial: { boxShadow: "0 0 0 0 rgba(79, 209, 197, 0)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(79, 209, 197, 0.7)",
      "0 0 0 10px rgba(79, 209, 197, 0)"
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut"
    }
  }
};

// Accessibility utilities
export const prefersReducedMotion = {
  getReducedAnimation: (animation) => {
    const reducedAnimation = {
      ...animation,
      visible: {
        ...animation.visible,
        transition: {
          ...animation.visible?.transition,
          duration: 0.1,
          delay: 0,
          staggerChildren: 0.05,
          delayChildren: 0.05,
          type: "tween",
          bounce: 0,
          stiffness: 100
        }
      }
    };
    return reducedAnimation;
  }
};

// Time saving indicator (for emphasizing time savings)
export const clockAnimation = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: { 
      duration: 20, 
      repeat: Infinity, 
      ease: "linear" 
    }
  }
};

// Service grid item hover (for service selection)
export const serviceCardAnimation = {
  rest: { 
    y: 0, 
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)" 
  },
  hover: {
    y: -10,
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    }
  },
  tap: {
    y: -3,
    boxShadow: "0 6px 10px rgba(0,0,0,0.12)",
    transition: { 
      duration: 0.1
    }
  },
  selected: {
    y: -5,
    boxShadow: "0 8px 16px rgba(0,0,0,0.12), 0 0 0 2px #4FD1C5",
    transition: { 
      duration: 0.2 
    }
  }
};