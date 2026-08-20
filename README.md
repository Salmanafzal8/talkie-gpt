# Talkie-GPT

Voice/text chat app built with **Expo (SDK 54)** that talks to a local LLM server (**Bionic / LM Studio**) running Gemma on your PC.

## Prerequisites

- **Node.js** 18+ (recommended 20+)
- **Expo Go** app on your phone (iOS / Android)
- **Bionic** or **LM Studio** with model `google/gemma-3-1b` loaded
- Local API listening on port **1234** with host **`0.0.0.0`** (not only `127.0.0.1`)

### Start the LLM server (required)

In LM Studio / Bionic CLI:

```bash
lms server start --bind 0.0.0.0 -p 1234 --cors
```

Quick check on the PC browser or terminal:

```bash
curl http://127.0.0.1:1234/v1/models
```

You should see JSON listing `google/gemma-3-1b`.

---

## Setup

```bash
cd D:\talkie-gpt
npm install
```

---

## Run the app (recommended: tunnel)

Office / guest Wi‑Fi often blocks phone → PC LAN. Use the Cloudflare tunnel helper so **both Expo and the LLM** are reachable from the phone.

1. Keep LLM server running on `0.0.0.0:1234`.
2. In a terminal:

```bat
cd D:\talkie-gpt
.\run-tunnel.cmd
```

Or:

```bash
npm run start:tunnel
```

3. Scan the **QR code** with Expo Go (or paste the printed `exp://…` URL).
4. Keep that terminal open while you use the app.

`expo-cf-tunnel` injects `EXPO_PUBLIC_LM_URL` automatically so the app calls the live LLM tunnel (not a dead old URL).

---

## Run on LAN (same Wi‑Fi, no isolation)

Only works if phone and PC can reach each other on the network.

1. Update `LAPTOP_IP` in `constants/config.ts` to your PC Wi‑Fi IPv4 (`ipconfig`).
2. Start LLM on `0.0.0.0:1234`.
3. Allow Windows Firewall TCP **1234** and **8081** if needed.
4. Start Expo:

```bash
npm run start:lan
```

5. Open Expo Go → scan QR / enter `exp://YOUR_PC_IP:8081`.

---

## App usage

- After the welcome animation, use the **text input** under the mic to send messages.
- Your message appears in the chat; the model reply appears below it.
- Mic UI is present; text path is the current temporary way to hit the backend.

---

## Project structure

| Path | Purpose |
|------|---------|
| `app/` | Expo Router screens |
| `app/screens/home.tsx` | Chat UI + text send |
| `hooks/useVoiceChat.ts` | Sends text to LLM |
| `services/llmservices.ts` | `fetch` to chat completions API |
| `constants/config.ts` | Model name + LLM base URL |
| `run-tunnel.cmd` | One-click Expo + LLM tunnels |

---

## Config

`constants/config.ts`:

- **Model:** `google/gemma-3-1b` (must match `/v1/models` id)
- **URL:** `EXPO_PUBLIC_LM_URL` when using tunnel, otherwise `http://LAPTOP_IP:1234`

Wrong model id or dead tunnel URL → chat fails (alerts / HTTP errors).

---

## Troubleshooting

### HTTP **530** from LM / Cloudflare

**Meaning:** The Cloudflare tunnel URL in the app is dead (process stopped or URL rotated).

**Fix:**

1. Confirm LLM is up: `curl http://127.0.0.1:1234/v1/models`
2. Restart with `.\run-tunnel.cmd` (new LLM tunnel is injected)
3. Reload the app in Expo Go

Do **not** hardcode an old `*.trycloudflare.com` URL.

### Expo: “Could not connect to development server” / “problem running the requested app”

- Prefer `.\run-tunnel.cmd` / `npm run start:tunnel` (not `expo start --tunnel` / ngrok on blocked networks).
- If `trycloudflare.com` is blocked on Wi‑Fi, try phone **mobile data**, or set DNS to `1.1.1.1`.
- Disable iCloud Private Relay / VPN on iPhone if tunnels fail.

### `npx expo start --tunnel` fails (`ngrok … took too long`)

Your network blocks ngrok. Use **`expo-cf-tunnel`** via `run-tunnel.cmd` instead.

### Chat alert: “LM Studio se is not working…”

- Server not running, wrong bind (`127.0.0.1` only), wrong model name, or tunnel/LAN unreachable.
- Check model id is exactly `google/gemma-3-1b`.

### Port 8081 already in use

```bat
netstat -ano | findstr :8081
taskkill /PID <pid> /F
```

Then run `.\run-tunnel.cmd` again.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Default Expo start |
| `npm run start:lan` | Expo on LAN |
| `npm run start:tunnel` | Expo + LLM Cloudflare tunnels + QR |
| `.\run-tunnel.cmd` | Same as `start:tunnel` (Windows helper) |

---

## Notes

- Quick Cloudflare tunnels get a **new URL every run** — always start the app with `run-tunnel.cmd` / `start:tunnel` so `EXPO_PUBLIC_LM_URL` stays in sync.
- This is a **dev** setup; don’t ship temporary tunnel URLs in production builds.
