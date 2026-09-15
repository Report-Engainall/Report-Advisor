// Canonical local worker bridge for pdfjs-dist's browser/Node URL resolution.
// Preserve the real worker side effects for browser Worker execution and expose
// WorkerMessageHandler for PDF.js's Node fake-worker path.
import 'pdfjs-dist/build/pdf.worker.mjs';
export { WorkerMessageHandler } from 'pdfjs-dist/build/pdf.worker.mjs';
