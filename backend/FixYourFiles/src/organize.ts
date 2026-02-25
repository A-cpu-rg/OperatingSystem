import fs from "fs-extra";
import path from "path";
import ora from "ora";
import readline from "readline";
import { getCategory } from "./rules.js";
import { logOperation } from "./logger.js";
import { showBanner, success } from "./ui.js";

function askConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question("Proceed with organizing? (y/n): ", answer => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

export async function organize(dir: string, options: { force?: boolean, skipConfirm?: boolean, silent?: boolean } = {}) {
  try {
    const files = await fs.readdir(dir);

    if (!options.silent) {
      showBanner();
    }

    if (!options.force && !options.skipConfirm) {
      const ok = await askConfirmation();
      if (!ok) {
        console.log("Cancelled.");
        return;
      }
    }

    const spinner = options.silent ? null : ora("Organizing files...").start();
    const ops: any[] = [];
    const summary: Record<string, number> = {};

    for (const file of files) {
      const full = path.join(dir, file);
      if ((await fs.stat(full)).isDirectory()) continue;

      const cat = getCategory(file);
      const target = path.join(dir, cat);
      await fs.ensureDir(target);

      const newPath = path.join(target, file);

      // if not forcing overwrite, check if exists and skip
      if (!options.force && await fs.pathExists(newPath)) {
        continue;
      }

      await fs.move(full, newPath, { overwrite: options.force });
      ops.push({ from: full, to: newPath });
    }

    await logOperation(ops);

    if (spinner) {
      spinner.succeed("Files organized successfully");
    }

    ops.forEach(op => {
      const folder = op.to.split(path.sep).slice(-2, -1)[0];
      summary[folder] = (summary[folder] || 0) + 1;
    });

    if (!options.silent) {
      console.log("\n📊 Summary:\n");
      for (const key in summary) {
        console.log(`  ${key}: ${summary[key]} files`);
      }
    } else {
      const total = Object.values(summary).reduce((a, b) => a + b, 0);
      if (total > 0) {
        success(`Auto-organized ${total} files into folders.`);
      }
    }

  } catch (err: any) {
    console.error(`Error: ${err.message}`);
  }
}
