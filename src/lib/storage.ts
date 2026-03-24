import path from 'node:path';
import { PRIVATE_STORAGE_DIR } from './config';

function ensurePrivateStorageRoot(): string {
  if (!PRIVATE_STORAGE_DIR) {
    throw new Error('PRIVATE_STORAGE_DIR is not configured');
  }

  const resolvedRoot = path.resolve(PRIVATE_STORAGE_DIR);
  const segments = resolvedRoot.split(path.sep).filter(Boolean);

  if (segments.includes('public') || segments.includes('static')) {
    throw new Error('PRIVATE_STORAGE_DIR must not be inside public/ or static/');
  }

  return resolvedRoot;
}

function ensureSafeSegment(value: string, label: string): string {
  if (!value) {
    throw new Error(`${label} is required`);
  }

  if (path.basename(value) !== value) {
    throw new Error(`${label} must not contain path separators`);
  }

  return value;
}

export function buildPrivateArtifactPath(submissionId: string, filename: string): string {
  const root = ensurePrivateStorageRoot();
  const safeSubmissionId = ensureSafeSegment(submissionId, 'submissionId');
  const safeFilename = ensureSafeSegment(filename, 'filename');

  const artifactPath = path.resolve(root, safeSubmissionId, safeFilename);
  const expectedPrefix = `${root}${path.sep}`;

  if (artifactPath !== root && !artifactPath.startsWith(expectedPrefix)) {
    throw new Error('Artifact path escaped PRIVATE_STORAGE_DIR');
  }

  return artifactPath;
}
