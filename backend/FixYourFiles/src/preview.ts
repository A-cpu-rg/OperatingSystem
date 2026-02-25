import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getCategory } from "./rules.js";
import { showBanner } from "./ui.js";

export async function preview(dir: string) {
  try {
    const files = await fs.readdir(dir);

    showBanner();
    console.log(chalk.bold("\n📂 Preview Mode\n"));

    for (const file of files) {
      const full = path.join(dir, file);
      if ((await fs.stat(full)).isDirectory()) continue;

      const category = getCategory(file);
      console.log(
        chalk.gray(file) +
        "  →  " +
        chalk.green.bold(category + "/")
      );
    }
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
  }
}
