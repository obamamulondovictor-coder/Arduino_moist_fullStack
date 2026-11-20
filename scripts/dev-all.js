const { spawn } = require("child_process");

function prefix(name, color, data, isErr) {
  const reset = "\x1b[0m";
  const text = data.toString();
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length === 0 && i === lines.length - 1) continue;
    const tag = color + "[" + name + "]" + reset + " ";
    if (isErr) {
      process.stderr.write(tag + line + "\n");
    } else {
      process.stdout.write(tag + line + "\n");
    }
  }
}

function run(name, command, args, color) {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: process.env,
  });

  child.stdout.on("data", (data) => prefix(name, color, data, false));
  child.stderr.on("data", (data) => prefix(name, color, data, true));
  child.on("exit", (code) => {
    const reset = "\x1b[0m";
    const msg = color + "[" + name + "]" + reset + " exited with code " + code + "\n";
    process.stdout.write(msg);
  });

  return child;
}

const backend = run("backend", "npm", ["--prefix", "moistBackend", "run", "dev"], "\x1b[32m");
const frontend = run("frontend", "npm", ["--prefix", "moistFrontend", "run", "dev"], "\x1b[36m");

function shutdown() {
  if (backend && !backend.killed) {
    try { backend.kill(); } catch (_e) {}
  }
  if (frontend && !frontend.killed) {
    try { frontend.kill(); } catch (_e) {}
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
