import { supabase } from '@/lib/supabase';
import type { Dataset, FileFormat } from '@/lib/file-engine/types';
import type { UniversalFolderEntity } from './folder-universal-sync';

const MAX_ROWS_PER_DATASET = 5000;
const MAX_CANONICAL_TEXT = 250_000;

type SnapshotInput = {
  companyId: string;
  importJobId?: string;
  sourceHash: string;
  sourcePath: string;
  sourceFormat: FileFormat;
  analysisStatus: 'analyzed' | 'completed' | 'failed' | 'skipped';
  entityType: UniversalFolderEntity;
  datasets: Dataset[];
  warnings?: string[];
};

function compactDataset(dataset: Dataset) {
  return {
    id: dataset.id,
    name: dataset.name,
    source: dataset.source,
    sheet: dataset.sheet ?? null,
    rowCount: dataset.rowCount,
    columnCount: dataset.columnCount,
    qualityScore: dataset.qualityScore,
    columns: dataset.columns,
    preview: dataset.preview.slice(0, 50),
    rows: dataset.rows.slice(0, MAX_ROWS_PER_DATASET),
  };
}

function buildCanonicalText(datasets: Dataset[]): string {
  const text = datasets.flatMap((dataset) => dataset.rows.slice(0, MAX_ROWS_PER_DATASET).map((row, index) =>
    `${dataset.name} · ROW ${index + 1}\n${Object.entries(row).map(([key, value]) => `${key}: ${String(value ?? '')}`).join('\n')}`,
  )).join('\n\n');
  return text.slice(0, MAX_CANONICAL_TEXT);
}

export async function saveSourceAnalysisSnapshot(input: SnapshotInput): Promise<string> {
  const datasets = input.datasets.map(compactDataset);
  const firstDataset = input.datasets[0];
  const visual = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'tiff', 'bmp'].includes(input.sourceFormat);
  const visualAssets = input.datasets.map((dataset) => ({
    datasetId: dataset.id,
    name: dataset.name,
    kind: visual ? 'ocr_document' : 'structured_dataset',
    sheet: dataset.sheet ?? null,
    rowCount: dataset.rowCount,
    qualityScore: dataset.qualityScore,
    ocr: dataset.source === 'pdf-ocr' || dataset.source === 'image',
  }));

  const { data, error } = await supabase
    .from('source_analysis_snapshots')
    .insert({
      company_id: input.companyId,
      import_job_id: input.importJobId ?? null,
      source_hash: input.sourceHash,
      source_path: input.sourcePath,
      source_format: input.sourceFormat,
      analysis_status: input.analysisStatus,
      entity_type: input.entityType,
      quality_score: input.datasets.length ? Math.round(input.datasets.reduce((sum, dataset) => sum + dataset.qualityScore, 0) / input.datasets.length) : 0,
      row_count: input.datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0),
      column_count: input.datasets.reduce((sum, dataset) => sum + dataset.columnCount, 0),
      datasets,
      canonical_text: buildCanonicalText(input.datasets),
      visual_assets: visualAssets,
      warnings: input.warnings ?? [],
      metadata: {
        dataset_count: input.datasets.length,
        primary_dataset: firstDataset?.name ?? null,
        structured_rows_retained_per_dataset: MAX_ROWS_PER_DATASET,
        canonical_text_max_chars: MAX_CANONICAL_TEXT,
        raw_source_hash: input.sourceHash,
      },
    })
    .select('id')
    .single();
  if (error) throw error;
  return String(data.id);
}
