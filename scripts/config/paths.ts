// scripts/config/paths.ts
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

export const PATHS = {
  PUBLIC: path.join(projectRoot, 'public'),
  DATA: path.join(projectRoot, 'public', 'data'),
  HISTORICAL: path.join(projectRoot, 'public', 'data', 'historical'),
  CURRENT: path.join(projectRoot, 'public', 'data', 'current'),
  CHECKSUM: path.join(projectRoot, 'public', 'data', 'checksum.json'),
  UTILS: path.join(projectRoot, 'src', 'utils')
} as const;