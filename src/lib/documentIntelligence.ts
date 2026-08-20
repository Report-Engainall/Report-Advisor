export interface ParsedDocumentBlock {
  type: string;
  text?: string;
  page?: number;
  confidence?: number;
}

export interface ParsedDocumentTable {
  page?: number;
  rows: Array<Array<string | number | null>>;
  confidence?: number;
}

export interface ParsedDocument {
  document: {
    mimeType: string;
    pages: unknown[];
    blocks: ParsedDocumentBlock[];
    tables: ParsedDocumentTable[];
    images: unknown[];
    metadata: Record<string, unknown>;
  };
  engine: string;
  warnings: string[];
}

export interface DocumentIntelligenceOptions {
  endpoint?: string;
  signal?: AbortSignal;
}

export async function parseWithDocumentIntelligence(file: File, options: DocumentIntelligenceOptions = {}): Promise<ParsedDocument | null> {
  const endpoint = options.endpoint?.replace(/\/$/, '');
  if (!endpoint) return null;

  const body = new FormData();
  body.append('file', file, file.name);

  try {
    const response = await fetch(`${endpoint}/v1/parse`, {
      method: 'POST',
      body,
      signal: options.signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as ParsedDocument;
  } catch {
    // The optional service must never become a hard dependency of the app.
    return null;
  }
}

export function extractDocumentText(parsed: ParsedDocument): string {
  return parsed.document.blocks
    .map(block => block.text?.trim())
    .filter((text): text is string => Boolean(text))
    .join('\n');
}

export function extractDocumentTables(parsed: ParsedDocument): ParsedDocumentTable[] {
  return parsed.document.tables.filter(table => Array.isArray(table.rows) && table.rows.length > 0);
}
