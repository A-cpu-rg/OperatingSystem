import chalk from "chalk";
import boxen from "boxen";
import gradient from "gradient-string";

export function showBanner() {
  const text = gradient.pastel.multiline(`
  FixYourFiles ✨
  Smart File Organizer
  `);

  console.log(
    boxen(text, {
      padding: 1,
      borderColor: "cyan",
      borderStyle: "round"
    })
  );
}

export function success(msg: string) {
  console.log(chalk.green(`✔ ${msg}`));
}

export function info(msg: string) {
  console.log(chalk.cyan(msg));
}

export function warn(msg: string) {
  console.log(chalk.yellow(msg));
}
