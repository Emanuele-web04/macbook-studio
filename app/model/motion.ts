export const LID_DURATION = 0.75;
export type LidMotion = { from: number; target: number; elapsed: number };
export function advanceLid(motion: LidMotion, dt: number) {
  motion.elapsed = Math.min(LID_DURATION, motion.elapsed + dt);
  const progress = motion.elapsed / LID_DURATION;
  // A finite exponential ease retains the gentle motion and reaches exact contact.
  if (progress >= 1 - 1e-10) return motion.target;
  const eased = (1 - Math.exp(-6 * progress)) / (1 - Math.exp(-6));
  return motion.from + (motion.target - motion.from) * eased;
}
