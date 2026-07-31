#!/usr/bin/env bun
//
// Interactive setup for the DevGuard Docker deployment.
//
//   * copies .env.example -> .env
//   * generates the four secrets at the top of the file
//   * asks how you want to reach DevGuard (localhost / OrbStack / Traefik)
//     and fills in the domain, protocol and passkey RP-ID accordingly
//
// Run it from the devguard-docker directory (identical on every OS); the
// container mounts the repo root as the working dir, so .env is read/written
// there regardless of where this script lives:
//
//   docker compose -f compose.configure.yaml run --rm configure
//
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const EXAMPLE_FILE = ".env.example";
const ENV_FILE = ".env";

// --- pretty output -----------------------------------------------------------
const tty = Boolean(process.stdout.isTTY);
const c = (code: string, s: string) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = (s: string) => c("1", s);
const dim = (s: string) => c("2", s);
const green = (s: string) => c("32", s);
const yellow = (s: string) => c("33", s);
const cyan = (s: string) => c("36", s);

const step = (s: string) => console.log(`${cyan("==>")} ${s}`);
const warn = (s: string) => console.log(yellow(`!  ${s}`));
const die = (s: string): never => {
  console.error(yellow("error: ") + s);
  process.exit(1);
};

// --- tiny prompt helpers -----------------------------------------------------
function ask(question: string, def?: string): string {
  const answer = prompt(question + (def !== undefined ? ` ${dim(`[${def}]`)}` : ""));
  const value = (answer ?? "").trim();
  return value === "" && def !== undefined ? def : value;
}

// --- prerequisites -----------------------------------------------------------
if (!existsSync(EXAMPLE_FILE)) {
  die(`${EXAMPLE_FILE} not found — is the repo mounted at /app?`);
}

// --- start from an existing .env, or seed one from .env.example --------------
// We only copy the template when there's no .env yet. Re-running against an
// existing .env updates it in place, so already-generated secrets survive
// (only "change-me" placeholders get filled — see below).
if (existsSync(ENV_FILE)) {
  step(`Updating existing ${ENV_FILE} in place`);
} else {
  copyFileSync(EXAMPLE_FILE, ENV_FILE);
  step(`Created ${ENV_FILE} from ${EXAMPLE_FILE}`);
}

// --- in-memory .env editing --------------------------------------------------
let env = readFileSync(ENV_FILE, "utf8");

/** Set KEY=value, matching an existing line by its key at line start. */
function setEnv(key: string, value: string): void {
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  // function replacer avoids `$` in the value being treated specially.
  env = re.test(env) ? env.replace(re, () => line) : `${env}\n${line}\n`;
}

/** Current value of KEY in the buffer, with surrounding quotes stripped. */
function getEnv(key: string): string | undefined {
  const m = env.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : undefined;
}

// --- generate secrets --------------------------------------------------------
// hex is URL-safe: the postgres passwords are interpolated into a DSN
// (postgres://user:PASSWORD@host/db) and must not contain / + @ : ? # etc.
// KRATOS_CIPHER_SECRET must be exactly 32 characters -> 16 hex bytes.
// Only the "change-me" placeholders are replaced — anything already set is kept.
const PLACEHOLDER = "change-me";
const secret = () => randomBytes(16).toString("hex"); // 32 hex chars
const SECRETS = [
  "POSTGRES_DEVGUARD_PASSWORD",
  "POSTGRES_KRATOS_PASSWORD",
  "KRATOS_COOKIE_SECRET",
  "KRATOS_CIPHER_SECRET",
];
step("Generating secrets");
const generated: string[] = [];
const kept: string[] = [];
for (const key of SECRETS) {
  if (getEnv(key) === PLACEHOLDER) {
    setEnv(key, `"${secret()}"`);
    generated.push(key);
  } else {
    kept.push(key);
  }
}
if (generated.length) console.log(dim(`  generated: ${generated.join(", ")}`));
if (kept.length) console.log(dim(`  kept existing: ${kept.join(", ")}`));

// --- pick a deployment mode --------------------------------------------------
console.log();
console.log(bold("How do you want to reach DevGuard?"));
console.log(`  ${bold("1)")} localhost   ${dim("- HTTP on localhost:3000 / :8080 (compose.localhost.yaml)")}`);
console.log(`  ${bold("2)")} OrbStack    ${dim("- HTTPS on a *.local domain, auto TLS (compose.orbstack.yaml)")}`);
console.log(`  ${bold("3)")} Traefik     ${dim("- reverse proxy on a custom domain (compose.traefik.yaml)")}`);
const mode = ask("Select [1-3]", "1");

/** Derive the passkey RP-ID from a web domain: strip scheme and :port. */
const rpIdFrom = (domain: string) => domain.replace(/^https?:\/\//, "").replace(/:\d+$/, "");

let modeName: string;
let composeFile: string;
let baseDomain = "";

switch (mode) {
  case "1":
    modeName = "localhost";
    composeFile = "compose.localhost.yaml";
    setEnv("DEVGUARD_WEB_DOMAIN", "localhost:3000");
    setEnv("DEVGUARD_API_DOMAIN", "localhost:8080");
    setEnv("DEVGUARD_PROTOCOL", "http");
    setEnv("KRATOS_PASSKEY_RP_ID", "localhost");
    break;

  case "2":
    modeName = "OrbStack";
    composeFile = "compose.orbstack.yaml";
    baseDomain = ask("Base domain", "devguard.local");
    setEnv("DEVGUARD_WEB_DOMAIN", baseDomain);
    setEnv("DEVGUARD_API_DOMAIN", `api.${baseDomain}`);
    setEnv("DEVGUARD_PROTOCOL", "https");
    setEnv("KRATOS_PASSKEY_RP_ID", rpIdFrom(baseDomain));
    break;

  case "3":
    modeName = "Traefik";
    composeFile = "compose.traefik.yaml";
    baseDomain = ask("Base domain", "devguard.local");
    setEnv("DEVGUARD_WEB_DOMAIN", baseDomain);
    setEnv("DEVGUARD_API_DOMAIN", `api.${baseDomain}`);
    setEnv("DEVGUARD_PROTOCOL", "http");
    setEnv("KRATOS_PASSKEY_RP_ID", rpIdFrom(baseDomain));
    warn("Traefik (as shipped) serves plain HTTP on :80. Passkeys need a secure");
    warn("context, so they only work on 'localhost' or over HTTPS — add TLS to");
    warn(".traefik/traefik.yml and set DEVGUARD_PROTOCOL=https for real use.");
    break;

  default:
    die(`Invalid selection: ${mode}`);
}

writeFileSync(ENV_FILE, env);
step(`Configured for ${bold(modeName!)} mode`);

// --- next steps --------------------------------------------------------------
console.log();
console.log(`${green("Done.")} Next steps:`);
console.log();
console.log(dim("  # 1. one-time init (encryption key, configs, database)"));
console.log("  docker compose -f compose.yaml -f compose.setup.yaml up devguard-setup postgresql");
console.log();
console.log(dim("  # 2. launch DevGuard"));
console.log(`  docker compose -f compose.yaml -f ${composeFile!} up -d --remove-orphans`);

if (mode === "3") {
  console.log();
  console.log(dim("  # Traefik: point the domain at your host, e.g. in /etc/hosts:"));
  console.log(`  127.0.0.1  ${baseDomain} api.${baseDomain}`);
}
