import fs from "node:fs";
import path from "node:path";

// For all the tasks in the "../tasks" folder, we want to import it and add its
// name to the list of tasks that we export from this file.
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const files = fs.readdirSync(path.join(__dirname, "tasks"));

// This is a list of all the tasks that we want to export from this file.
export type Task = {
  name: string;
  filename: string;
  handler: (args?: Record<string, unknown>) => Promise<void> | void;
};

export type Tasks = {
  [key: string]: Task;
};

const tasks: Tasks = {};

// For each task in the "tasks" folder, we want to import it and add it to the
// list of tasks that we export from this file.
for (const filename of files) {
  const extension = path.extname(filename);
  if (extension !== ".js") {
    continue;
  }

  const name = path.basename(filename, extension);
  const filepath = path.join(__dirname, "tasks", filename);
  tasks[name] = {
    name,
    filename,
    handler: async (args: unknown) => {
      // Import the task from the file.
      const task: unknown = await import(filepath);

      // Check to see that the task has a default export, and that it's a
      // function.
      if (typeof task !== "object" || task === null || !("default" in task)) {
        throw new Error(`Task "${name}" does not have a default export`);
      }

      if (typeof task.default !== "function") {
        throw new Error(`Default export for task "${name}" is not a function`);
      }

      // Replace the task with the default export from the module. Now every time
      // we call the task, we will call the default export from the module and not
      // this function.
      // biome-ignore lint/suspicious/noExplicitAny: migration
      tasks[name] = task.default as any;

      // Call the task and return the result.
      return task.default(args);
    },
  };
}

export default tasks;
