import fs from "fs-extra";
import { popHistory, clearLog } from "./logger.js";
import ora from "ora";

export async function undo() {
  const spinner = ora("Undoing the last operation...").start();
  try {
    const lastSession = await popHistory();
    if (!lastSession || lastSession.operations.length === 0) {
      spinner.info("Nothing to undo in history.");
      return;
    }

    let undone = 0;
    for (const op of lastSession.operations.reverse()) {
      if (await fs.pathExists(op.to)) {
        await fs.move(op.to, op.from, { overwrite: true });
        undone++;
      }
    }

    spinner.succeed(`Undo complete! Restored ${undone} files to their original location.`);
  } catch (err: any) {
    spinner.fail(`Error: ${err.message}`);
  }
}
