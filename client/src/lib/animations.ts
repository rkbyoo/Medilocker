/**
 * Animation Library
 * Shared animation variants for Framer Motion
 * Refined Healthcare Design System
 */

import { Variants, Transition } from 'framer-motion';

// Standard easings as tuples for Framer Motion
export const easings = {
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.87, 0, 0.13, 1] as [number, number, number, number],
  easeOutBack: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

// Standard transitions
export const transitions: Record<string, Transition> = {
  fast: {
    duration: 0.15,
    ease: easings.easeOut,
  },
  base: {
    duration: 0.2,
    ease: easings.easeOut,
  },
  slow: {
    duration: 0.3,
    ease: easings.easeOut,
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  springSoft: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },
};

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Fade in with upward movement
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

// Fade in with downward movement
export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: transitions.fast,
  },
};

// Scale in animation
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.springSoft,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast,
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.fast,
  },
};

// Stagger container for children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Stagger item for use inside staggerContainer
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.springSoft,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

// Card hover animation
export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: transitions.springSoft,
  },
};

// Button press animation
export const buttonPress = {
  rest: { scale: 1 },
  pressed: { scale: 0.98 },
};

// Page transition
export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 10 
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
};

// Modal animation
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.base,
  },
  exit: { 
    opacity: 0,
    transition: transitions.fast,
  },
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springSoft,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

// List item animation
export const listItem: Variants = {
  hidden: { 
    opacity: 0, 
    x: -10 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: transitions.fast,
  },
};

// Loading skeleton shimmer animation
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// Pulse animation for loading states
export const pulse = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// Accordion animation
export const accordionContent: Variants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: easings.easeOut,
    },
  },
};

// Toast notification animation
export const toast: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: transitions.fast,
  },
};
