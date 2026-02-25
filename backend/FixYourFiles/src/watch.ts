import chokidar from "chokidar";
import path from "path";
import chalk from "chalk";
import { organize } from "./organize.js";
import { showBanner } from "./ui.js";

export async function watchDirs(dirs: string[]) {
    showBanner();

    const watchPaths = dirs.map(d => path.resolve(d));
    console.log(chalk.blue(`\n👀 Watching ${watchPaths.length} directories for new files...\n`));

    const watcher = chokidar.watch(watchPaths, {
        ignored: /(^|[\/\\])\..|node_modules|\.json$/, // ignore dotfiles, node_modules, json logs
        persistent: true,
        ignoreInitial: true,
        depth: 0 // only watch root of specified dirs
    });

    watcher.on('add', async (filePath) => {
        const dir = path.dirname(filePath);
        console.log(chalk.gray(`\n>> New file detected: `) + chalk.white(path.basename(filePath)));

        // Auto organize with silent mode so we don't spam banner/summary every time
        await organize(dir, { skipConfirm: true, silent: true });
    });

    watcher.on('error', error => console.error(`Watcher error: ${error}`));
}
