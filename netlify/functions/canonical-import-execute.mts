          companyId: String(companyId),
          requestedBy: userData.user.id,
        },
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`CANONICAL_IMPORT_DURABLE_RUN_FAILED:${entityType}:${job.id}:${detail}`);
    }

    let snapshotId: string | null = null;
    const { data: snapshot, error: snapshotError } = await serviceClient
        .from('source_analysis_snapshots')
        .insert({
          company_id: companyId,
          import_job_id: job.id,
          source_hash: sourceSha,
          source_path: storagePath,
          source_format: detection.format,
          analysis_status: 'analyzed',
          entity_type: 'source-data',
          quality_score: authoritativeQualityScore,
          row_count: authoritativeRows.length,
          column_count: Array.isArray(authoritativeDataset.columns) ? authoritativeDataset.columns.length : 0,
          datasets: [{
            name: fileRecord.file_name || fileName || 'import',
            rowCount: authoritativeRows.length,
            columnCount: Array.isArray(authoritativeDataset.columns) ? authoritativeDataset.columns.length : 0,
            columns: authoritativeDataset.columns,
            preview: Array.isArray(authoritativeDataset.preview) ? authoritativeDataset.preview.slice(0, 25) : [],
          }],
          canonical_text: [
            `source=${fileRecord.file_name || fileName || 'import'}`,
            `server_authoritative_quality=${authoritativeQualityScore}%`,
            `source_sha=${sourceSha}`,
          ].join(' | '),
          visual_assets: [],
          warnings: [],
          metadata: {
            fileName: fileRecord.file_name || fileName || 'import',
            sourceFormat: detection.format,
            serverAuthoritativeSource: true,
            serverAuthoritativeQualityScore: authoritativeQualityScore,
            committed: authoritativeRows.length,
            jobId: execution.jobId,
            sourceStoragePath: storagePath,
          },
        })
        .select('id')
        .single();
      if (snapshotError || !snapshot?.id) {
        throw new Error('AUTHORITATIVE_SOURCE_ANALYSIS_PERSIST_FAILED:' + (snapshotError?.message ?? 'EMPTY_SNAPSHOT_ID'));
      }
      snapshotId = snapshot.id;

      const { data: completedReport, error: completedReportError } = await serviceClient
        .from('report_execution_jobs')
        .select('evidence')
        .eq('id', execution.jobId)
        .eq('company_id', companyId)
        .maybeSingle();
      if (completedReportError || !completedReport) {
        throw new Error('REPORT_EXECUTION_EVIDENCE_READBACK_FAILED');
      }

      const evidence = completedReport.evidence && typeof completedReport.evidence === 'object'
        ? completedReport.evidence as Record<string, unknown>
        : {};
      const rendered = evidence.renderedOutput && typeof evidence.renderedOutput === 'object'
        ? evidence.renderedOutput as Record<string, unknown>
        : {};
      const linkedEvidence = {
        ...evidence,
        sourceSnapshotId: snapshotId,
        evidenceStatus: 'VERIFIED',
        renderedOutput: {
          ...rendered,
          sourceSnapshotId: snapshotId,
          evidenceStatus: 'VERIFIED',
          sourceAnalysisSnapshotId: snapshotId,
        },
      };

      const { error: evidenceUpdateError } = await serviceClient
        .from('report_execution_jobs')
        .update({ evidence: linkedEvidence })
        .eq('id', execution.jobId)
        .eq('company_id', companyId);
      if (evidenceUpdateError) {
        throw new Error('REPORT_EXECUTION_EVIDENCE_LINK_FAILED:' + evidenceUpdateError.message);
      }

    return json(200, {
      ...execution,
      importId: job.id,
      sourceHash: sourceSha,
      snapshotId,
      authoritativeRowCount: authoritativeRows.length,
      authoritativeQualityScore,
      authoritativeColumns: authoritativeDataset.columns,
      authoritativePreview: authoritativeDataset.preview.slice(0, 25),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED';
    console.error('[canonical-import-execute] failed', error);
    const status = message.startsWith('NETLIFY_ENV_MISSING') ? 503 : 400;
    const debugEnabled = Netlify.env.get('REPORT_ADVISOR_E2E_DEBUG') === '1';
    const detail = debugEnabled
      ? message.slice(0, 512)
      : 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED';
    return json(status, { error: 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED', detail });
  }
}

export default async (request: Request): Promise<Response> => {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const cloned = request.clone();
    try {
      const body = await cloned.json() as { resumeReportExecutionJobId?: string };
      if (typeof body.resumeReportExecutionJobId === 'string' && body.resumeReportExecutionJobId.trim()) {
        const backgroundUrl = new URL('/.netlify/functions/canonical-import-resume-background', request.url);
        const dispatched = await fetch(backgroundUrl, {
          method: 'POST',
          headers: {
            Authorization: request.headers.get('authorization') ?? '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (!dispatched.ok) {