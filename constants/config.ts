// Prefer tunnel URL injected by `expo-cf-tunnel` (EXPO_PUBLIC_LM_URL).
// Fallback: LAN IP of this PC (update if your Wi‑Fi IP changes).
const LAPTOP_IP = "192.168.18.23";
const LM_BASE =
  (process.env.EXPO_PUBLIC_LM_URL || `http://${LAPTOP_IP}:1234`).replace(
    /\/$/,
    ""
  );

export const LM_STUDIO_URL = `${LM_BASE}/v1/chat/completions`;
export const LM_STUDIO_MODEL_NAME = "google/gemma-3-1b";
