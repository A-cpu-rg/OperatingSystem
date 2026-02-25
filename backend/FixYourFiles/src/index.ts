#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { select, input } from "@inquirer/prompts";
import { organize } from "./organize.js";
import { preview } from "./preview.js";
import { undo } from "./undo.js";
import { showHistory } from "./history.js";
import { watchDirs } from "./watch.js";

const program = new Command();

program.name("fixyourfiles");

program.command("preview").argument("<dir>").action(preview);

program
    .command("organize")
    .argument("<dir>")
    .option("--force", "Skip confirmation")
    .action(organize);

program
    .command("clean")
    .argument("<dir>")
    .option("--force", "Skip confirmation")
    .description("Clean and organize everything")
    .action(organize);

program
    .command("history")
    .description("View operation history across all directories")
    .action(showHistory);

program
    .command("watch")
    .argument("<dirs...>")
    .description("Start a background service that continuously monitors and organizes folders")
    .action(watchDirs);

program
    .command("undo")
    .description("Undo the last sequence of organized files")
    .action(undo);

async function runInteractiveMenu() {
    console.log(chalk.bold.blue("\n✨ Welcome to FixYourFiles ✨\n"));

    while (true) {
        const action = await select({
            message: "What would you like to do?",
            choices: [
                { name: "🔍 Preview organization", value: "preview", description: "See what happens without moving files" },
                { name: "🧹 Organize files", value: "organize", description: "Smartly sort files into folders" },
                { name: "⏪ Undo last operation", value: "undo", description: "Put files back where they were" },
                { name: "📜 View history", value: "history", description: "See previously organized files" },
                { name: "👀 Watch directory", value: "watch", description: "Run in background and auto-organize new files" },
                { name: "❌ Exit", value: "exit" }
            ]
        });

        if (action === "exit") {
            console.log(chalk.gray("Goodbye! 👋\n"));
            process.exit(0);
        }

        try {
            if (action === "undo") {
                await undo();
            } else if (action === "history") {
                await showHistory();
            } else {
                const dir = await input({
                    message: "Enter the directory path to operate on:",
                    default: "./"
                });

                if (action === "preview") {
                    await preview(dir);
                } else if (action === "organize") {
                    await organize(dir);
                } else if (action === "watch") {
                    await watchDirs([dir]);
                    return; // watch runs forever, so we can stop the loop
                }
            }
        } catch (error: any) {
            console.error(chalk.red(`\nAn error occurred: ${error.message}`));
        }

        console.log("\n");
        await input({ message: chalk.cyan("Press Enter to return to the menu...") });
        console.clear();
        console.log(chalk.bold.blue("✨ FixYourFiles ✨\n"));
    }
}

// If no arguments provided, run interactive menu
if (process.argv.length === 2) {
    runInteractiveMenu().catch((err) => {
        if (err.name === 'ExitPromptError') {
            console.log(chalk.gray("\nGoodbye! 👋\n"));
        } else {
            console.error(chalk.red(`\nFatal error: ${err.message}`));
        }
        process.exit(1);
    });
} else {
    program.parse(process.argv);
}
