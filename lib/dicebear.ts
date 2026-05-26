// Generates a default avatar URL based on a stable seed (email or userId).
// Uses the public DiceBear API — no auth, no setup, free forever.
export function defaultAvatar(seed: string): string {
  const safe = encodeURIComponent(seed.trim().toLowerCase() || "user");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${safe}&backgroundColor=8b5cf6,7c3aed,6366f1,4f46e5`;
}
