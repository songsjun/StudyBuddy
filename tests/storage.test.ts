describe('buildPrivateArtifactPath', () => {
  const originalPrivateStorageDir = process.env.PRIVATE_STORAGE_DIR;

  afterEach(() => {
    if (originalPrivateStorageDir === undefined) {
      delete process.env.PRIVATE_STORAGE_DIR;
    } else {
      process.env.PRIVATE_STORAGE_DIR = originalPrivateStorageDir;
    }
    jest.resetModules();
  });

  it('builds an absolute path rooted under PRIVATE_STORAGE_DIR', async () => {
    process.env.PRIVATE_STORAGE_DIR = '/var/app/private-artifacts';
    const { buildPrivateArtifactPath } = await import('../src/lib/storage');

    const result = buildPrivateArtifactPath('sub_123', 'essay.pdf');

    expect(result).toBe('/var/app/private-artifacts/sub_123/essay.pdf');
    expect(result.endsWith('/sub_123/essay.pdf')).toBe(true);
    expect(result).not.toContain('/public/');
    expect(result).not.toContain('/static/');
  });

  it('throws when PRIVATE_STORAGE_DIR is missing', async () => {
    delete process.env.PRIVATE_STORAGE_DIR;
    const { buildPrivateArtifactPath } = await import('../src/lib/storage');

    expect(() => buildPrivateArtifactPath('sub_123', 'essay.pdf')).toThrow(
      'PRIVATE_STORAGE_DIR is not configured'
    );
  });

  it('preserves the original filename and extension', async () => {
    process.env.PRIVATE_STORAGE_DIR = '/srv/uploads';
    const { buildPrivateArtifactPath } = await import('../src/lib/storage');

    const result = buildPrivateArtifactPath('submission_9', 'draft.final.docx');

    expect(result).toBe('/srv/uploads/submission_9/draft.final.docx');
  });

  it('rejects storage roots inside public or static directories', async () => {
    process.env.PRIVATE_STORAGE_DIR = '/var/www/public/uploads';
    const { buildPrivateArtifactPath } = await import('../src/lib/storage');

    expect(() => buildPrivateArtifactPath('sub_123', 'essay.pdf')).toThrow(
      'PRIVATE_STORAGE_DIR must not be inside public/ or static/'
    );
  });

  it('rejects path traversal in submissionId or filename', async () => {
    process.env.PRIVATE_STORAGE_DIR = '/srv/private';
    const { buildPrivateArtifactPath } = await import('../src/lib/storage');

    expect(() => buildPrivateArtifactPath('../sub_123', 'essay.pdf')).toThrow(
      'submissionId must not contain path separators'
    );
    expect(() => buildPrivateArtifactPath('sub_123', '../essay.pdf')).toThrow(
      'filename must not contain path separators'
    );
  });

  it('rejects dot segments in submissionId or filename', async () => {
    process.env.PRIVATE_STORAGE_DIR = '/srv/private';
    const { buildPrivateArtifactPath } = await import('../src/lib/storage');

    expect(() => buildPrivateArtifactPath('.', 'essay.pdf')).toThrow(
      "submissionId must not be '.' or '..'"
    );
    expect(() => buildPrivateArtifactPath('..', 'essay.pdf')).toThrow(
      "submissionId must not be '.' or '..'"
    );
    expect(() => buildPrivateArtifactPath('sub_123', '.')).toThrow(
      "filename must not be '.' or '..'"
    );
    expect(() => buildPrivateArtifactPath('sub_123', '..')).toThrow(
      "filename must not be '.' or '..'"
    );
  });
});
