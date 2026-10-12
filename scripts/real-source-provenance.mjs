function isRepositoryFixturePath(value) {
  const candidate = String(value ?? '').trim().replaceAll(String.fromCharCode(92), '/');
  return /(?:^|\/)(?:tests?|__tests__|fixtures?|__fixtures__|mocks?|samples?|examples?)(?:\/|$)/i.test(candidate);
}

/** Corpus metadata alone is insufficient proof that a source is a real upload. */
export function isGovernedRealFileRecord(record, sourcePath = null) {
  const metadata = record?.metadata && typeof record.metadata === 'object' ? record.metadata : {};
  const reportCorpus = metadata.report_corpus === true || String(metadata.report_corpus ?? '').toLowerCase() === 'true';
  const fixtureType = String(metadata.fixture_type ?? '').trim().toLowerCase();
  const catalogId = String(metadata.catalog_id ?? '').trim().toLowerCase();
  const provenancePaths = [
    record?.file_name, record?.storage_path, record?.source_path, sourcePath,
    metadata.source_path, metadata.sourcePath, metadata.original_path, metadata.upload_path,
    metadata.repo_path, metadata.fixture_path, metadata.origin_path,
  ];
  const carriesFixturePath = provenancePaths.some(isRepositoryFixturePath);
  const explicitFixture = /(?:synthetic|fixture|e2e|test|mock)/i.test(fixtureType)
    || catalogId === 'report-intelligence.48';
  return reportCorpus && !explicitFixture && !carriesFixturePath;
}
