import fs from 'fs';
import os from 'os';
import path from 'path';

export type DataDirResolution = {
  dir: string;
  isTemp: boolean;
};

function canUseDir(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export function resolveDataDir(): DataDirResolution {
  const envDir = process.env.DATA_DIR?.trim();
  const candidates = [
    envDir,
    path.join(process.cwd(), 'data'),
    path.join(os.tmpdir(), 'arreport-data')
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    if (canUseDir(dir)) {
      return { dir, isTemp: dir.startsWith(os.tmpdir()) };
    }
  }

  throw new Error('No writable data directory found');
}
