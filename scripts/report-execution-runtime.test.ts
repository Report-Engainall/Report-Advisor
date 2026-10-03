
const renderedSource = buildRenderedOutput({
  importId: 'import-render-test',
  fileName: 'sales invoices.pdf',
  sourceHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  entityType: 'sales_invoices',
  qualityScore: 92,
  qualityApproved: true,
  rows: Array.from({ length: 12 }, (_, index) => ({
    rowNumber: index + 1,
    data: {
      total: index === 0 ? 10 : 0,
      net_sales: index === 0 ? 10 : 0,
      invoice_number: 101,
      customer_name: 'عميل',
      invoice_type: 'آجل',
      date: '2026-01-02',
    },
    provenance: {
      sourceHash: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      sourceId: 'source-' + String(index + 1),
      sourceDocumentId: 'doc-' + String(index + 1),
      evidenceId: 'evidence-' + String(index + 1),
      tenantId: 'tenant-test',
      lineageId: 'line-' + String(index + 1),
    },
  })),
});
assert.equal(renderedSource.sourceMetrics.totalAmount, 10);
assert.equal(renderedSource.sourceMetrics.uniqueInvoiceCount, 1);
assert.equal(renderedSource.sourceMetrics.receivableCandidate, 10);
assert.equal(renderedSource.sourceMetrics.asOfStart, '2026-01-02');
assert.equal(renderedSource.sourceMetrics.asOfEnd, '2026-01-02');
assert.equal(renderedSource.archetypeId, 'sales.invoice-detail');
assert.equal(renderedSource.archetypeVersion, 1);
assert.equal(renderedSource.profileVersion, 1);
assert.equal(renderedSource.archetypeState, 'SUPPORTED');
assert.equal(typeof renderedSource.archetypeReason, 'string');