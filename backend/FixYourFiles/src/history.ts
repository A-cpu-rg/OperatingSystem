import chalk from "chalk";
import { getHistory } from "./logger.js";
import { showBanner } from "./ui.js";

export async function showHistory() {
    showBanner();
    console.log(chalk.bold("\n📜 Version History\n"));

    const history = await getHistory();
    if (history.length === 0) {
        console.log(chalk.gray("No previous logs found. Start organizing!"));
        return;
    }

    history.forEach((entry, idx) => {
        const date = new Date(entry.date).toLocaleString();
        console.log(
            chalk.cyan(`[#${idx + 1}] `) +
            chalk.white.bold(date) +
            chalk.gray(` - Organized ${entry.operations.length} files`)
        );
    });

    console.log("\nType " + chalk.yellow(`fixyourfiles undo`) + " to revert the most recent operations.");
}
