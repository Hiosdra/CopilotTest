import * as readline from "node:readline";

export async function prompt(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const displayQuestion = defaultValue ? `${question} (${defaultValue}) ` : `${question} `;

    rl.question(displayQuestion, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || "");
    });
  });
}
