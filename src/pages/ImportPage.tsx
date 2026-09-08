import { ExternalFileAnalysisPage } from '@/pages/ExternalFileAnalysisPage';
import { CanonicalImportPage } from '@/pages/CanonicalImportPage';
import { FolderBatchImportPanel } from '@/components/FolderBatchImportPanel';
import { ImportIntelligenceCockpit } from '@/components/ImportIntelligenceCockpit';
import { ImportMappingDictionaryPanel } from '@/components/ImportMappingDictionaryPanel';

export function ImportPage() {
  return <div className="space-y-6">
    <ImportIntelligenceCockpit />
    <ExternalFileAnalysisPage />
    <CanonicalImportPage />
    <ImportMappingDictionaryPanel />
    <FolderBatchImportPanel />
  </div>;
}
