// Canonical local worker bridge for pdfjs-dist's legacy build.
// The Node adapter loads the legacy main build, so the worker must come from
// the matching legacy distribution rather than the modern worker bundle.
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
export { WorkerMessageHandler } from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
