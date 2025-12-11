// utils/animations.ts
import {
  Easing,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * Animation presets for consistent app-wide animations
 */

export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const timingConfig = {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Scale animation for press interactions
 */
export const scaleAnimation = {
  press: () => withSpring(0.95, springConfig),
  release: () => withSpring(1, springConfig),
};

/**
 * Fade animations
 */
export const fadeAnimation = {
  in: () => withTiming(1, timingConfig),
  out: () => withTiming(0, timingConfig),
};

/**
 * Slide animations
 */
export const slideAnimation = {
  up: (distance: number = 20) => withSpring(0, springConfig),
  down: (distance: number = 20) => withSpring(distance, springConfig),
};

/**
 * Bounce animation for success feedback
 */
export const bounceAnimation = () =>
  withSequence(
    withSpring(1.1, springConfig),
    withSpring(0.95, springConfig),
    withSpring(1, springConfig)
  );

/**
 * Shake animation for error feedback
 */
export const shakeAnimation = () =>
  withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );

/**
 * Pulse animation for notifications
 */
export const pulseAnimation = () =>
  withSequence(
    withTiming(1.05, { duration: 300 }),
    withTiming(1, { duration: 300 })
  );

/**
 * Staggered list animations
 */
export const staggeredAnimation = (index: number, delay: number = 50) => ({
  entering: withDelay(index * delay, withSpring(1, springConfig)),
});
