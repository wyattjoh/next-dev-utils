function info(message: string, ...args: unknown[]) {
  let line = message;
  if (args.length > 0) {
    line += ` ${args.join(" ")}`;
  }
  line += "\n";

  const isPiped = !Deno.stdout.isTerminal();
  if (isPiped) {
    Deno.stderr.writeSync(new TextEncoder().encode(line));
  } else {
    Deno.stdout.writeSync(new TextEncoder().encode(line));
  }
}

function warn(message: string, ...args: unknown[]) {
  let line = `[WARN] ${message}`;
  if (args.length > 0) {
    line += ` ${args.join(" ")}`;
  }
  line += "\n";

  Deno.stderr.writeSync(new TextEncoder().encode(line));
}

function error(message: string, ...args: unknown[]) {
  let line = message;
  if (args.length > 0) {
    line += ` ${args.join(" ")}`;
  }
  line += "\n";

  Deno.stderr.writeSync(new TextEncoder().encode(line));
}

const logger = {
  info,
  warn,
  error,
};

export default logger;
