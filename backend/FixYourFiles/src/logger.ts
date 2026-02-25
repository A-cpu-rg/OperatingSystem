import fs from "fs-extra";
import path from "path";

const LOG = path.join(process.cwd(), ".fixyourfiles-history.json");

export interface HistoryOp {
  from: string;
  to: string;
}

export interface HistoryEntry {
  id: number;
  date: string;
  operations: HistoryOp[];
}

let writePromise = Promise.resolve();

export const logOperation = async (ops: HistoryOp[]) => {
  if (ops.length === 0) return; // Don't log if nothing happened

  const performWrite = async () => {
    let history: HistoryEntry[] = [];
    try {
      if (await fs.pathExists(LOG)) {
        history = await fs.readJson(LOG);
      }
    } catch {
      // Corrupt file, start fresh
      history = [];
    }

    history.push({
      id: Date.now(),
      date: new Date().toISOString(),
      operations: ops,
    });

    await fs.writeJson(LOG, history, { spaces: 2 });
  };

  writePromise = writePromise.then(performWrite).catch(err => {
    console.error("Logger error:", err);
  });

  await writePromise;
};

export const popHistory = async (): Promise<HistoryEntry | null> => {
  if (!(await fs.pathExists(LOG))) return null;
  const history: HistoryEntry[] = await fs.readJson(LOG);
  if (history.length === 0) return null;

  const last = history.pop()!;
  await fs.writeJson(LOG, history, { spaces: 2 });
  return last;
};

export const getHistory = async (): Promise<HistoryEntry[]> => {
  if (!(await fs.pathExists(LOG))) return [];
  return fs.readJson(LOG);
};

export const clearLog = async () => {
  if (await fs.pathExists(LOG)) await fs.remove(LOG);
};
