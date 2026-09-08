import { ExternalFileAnalysisPage } from '@/pages/ExternalFileAnalysisPage';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';

export function ImportPage() {
  return <div className="space-y-6">
    <ExternalFileAnalysisPage />
    <CanonicalImportPage />
    <FolderBatchImportPanel />
  </div>;
}
