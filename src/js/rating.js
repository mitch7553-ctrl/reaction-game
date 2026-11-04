// Informal game-specific categories, not population percentiles or clinical norms.
export const RATING_BANDS = Object.freeze([
  { max: 149, key: "amazing", label: "Amazing", explanation: "Lightning-fast response. Under 150 milliseconds!" },
  { max: 199, key: "very-good", label: "Very good", explanation: "Excellent speed. You're reacting very quickly." },
  { max: 249, key: "good", label: "Good", explanation: "A solid, quick response. Keep practicing!" },
  { max: 349, key: "average", label: "Average", explanation: "A steady reaction. Try another round to improve." },
  { max: Infinity, key: "below-average", label: "Below average", explanation: "A slower round. Focus on the signal and try again." },
]);

export function rateReaction(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError("Reaction time must be a nonnegative finite number");
  }
  return RATING_BANDS.find((band) => milliseconds <= band.max);
}
