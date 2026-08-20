const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

const root = path.join(__dirname, "..");
const cloudflared = path.join(root, ".tools", "cloudflared.exe");
const logFile = path.join(process.env.TEMP || ".", "talkie-cf-tunnel.log");

if (!fs.existsSync(cloudflared)) {
  console.error("Missing cloudflared at", cloudflared);
  process.exit(1);
}

try {
  fs.writeFileSync(logFile, "");
} catch {}

const child = spawn(cloudflared, ["tunnel", "--url", "http://127.0.0.1:8081"], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});

let found = false;
const buffer = { text: "" };

function onChunk(chunk) {
  const s = chunk.toString();
  buffer.text += s;
  process.stderr.write(s);

  if (found) return;
  const m = buffer.text.match(/https:\/\/([a-z0-9-]+\.trycloudflare\.com)/i);
  if (!m) return;

  found = true;
  const expUrl = `exp://${m[1]}:443`;
  console.log("\n========================================");
  console.log("Scan with Expo Go:");
  console.log(expUrl);
  console.log("========================================\n");
  qrcode.generate(expUrl, { small: true });
  console.log("\nKeep this window open. Press Ctrl+C to stop.\n");
}

child.stdout.on("data", onChunk);
child.stderr.on("data", onChunk);

child.on("exit", (code) => {
  console.log("Tunnel exited:", code);
  process.exit(code || 0);
});

process.on("SIGINT", () => {
  child.kill();
  process.exit(0);
});
