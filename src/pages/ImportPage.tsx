import { ExternalFileAnalysisPage } from '@/pages/ExternalFileAnalysisPage';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';
import { ImportIntelligenceCockpit } from '@/components/ImportIntelligenceCockpit';

export function ImportPage() {
  return <div className="space-y-6">
    <ImportIntelligenceCockpit />
    <ExternalFileAnalysisPage />
    <CanonicalImportPage />
    <FolderBatchImportPanel />
  </div>;
}
