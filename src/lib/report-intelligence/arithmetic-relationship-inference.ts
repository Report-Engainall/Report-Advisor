import { parseNumber } from '../file-engine/normalizer.ts';
import type { ReportIntelligence, ReportSignal, ReportRecommendation, BusinessFinding } from './report-smart-insights.ts';

export const ARITHMETIC_RELATIONSHIP_LIMITS = {
  columns: 8,
  rows: 1000,
  minimumRows: 12,
  results: 20,
  absoluteTolerance: 0.01,
  relativeTolerance: 1e-9,
} as const;

export type ArithmeticOperation = '+' | '−' | '×' | '÷' | '%';

export type ArithmeticRelationshipCandidate = {
  formula: string;
  columns: [string, string, string];
  indexes: [number, number, number];
  operation: ArithmeticOperation;
  status: 'supported' | 'counterexamples';
  discovery: { rows: number[]; matches: number; sampleSize: number };
  validation: { rows: number[]; matches: number; sampleSize: number };
  excludedRows: number[];
  maxResidual: number;
  counterexamples: Array<{ row: number; actual: number; expected: number; residual: number }>;
};

export type ArithmeticRelationshipInference = {
  status: 'evaluated' | 'insufficient' | 'unavailable' | 'partial_source';
  reason: string | null;
  limits: typeof ARITHMETIC_RELATIONSHIP_LIMITS;
  sourceRows: number;
  sampledRows: number;
  numericColumns: number;
  testedEquations: number;
  omittedCandidates: number;
  truncated: boolean;
  candidates: ArithmeticRelationshipCandidate[];
};

export type ArithmeticRelationshipColumn = {
  name: string;
  mappedField?: string | null;
  dataType?: string | null;
  mappingConfidence?: number | null;
  index?: number;
};

export type ArithmeticRelationshipRow = {
  row_number?: number;
  data?: Record<string, unknown> | null;
};

type NumericColumn = ArithmeticRelationshipColumn & {
  index: number;
  values: Array<number | null>;
  validCount: number;
  coverage: number;
};

type Observation = {
  sampleIndex: number;
  row: number;
  left: number;
  right: number;
  actual: number;
  expected: number;
  residual: number;
  matches: boolean;
};

const NUMERIC_TYPES = new Set(['number', 'numeric', 'integer', 'decimal', 'currency', 'percentage', 'float', 'double']);
const NON_NUMERIC_TYPES = new Set(['text', 'string', 'date', 'datetime', 'boolean', 'time']);
const IDENTIFIER_HEADER = /(?:^|[\\s_./-])(?:id|code|sku|barcode|serial|phone|mobile|row|line|invoice|document|account|reference|uuid)(?:$|[\\s_./-])|(?:كود|رمز|باركود|هاتف|جوال|تسلسل|مرجع|معرف|رقم الفاتورة|رقم المستند)/iu;

function text(value: unknown): string {
  return String(value ?? '').trim();
}

function rowValue(row: ArithmeticRelationshipRow, column: ArithmeticRelationshipColumn, mappedFieldIsUnique: boolean): unknown {
  const data = row.data ?? {};
  if (Object.prototype.hasOwnProperty.call(data, column.name)) return data[column.name];
  const mappedField = text(column.mappedField);
  if (mappedField && mappedFieldIsUnique && Object.prototype.hasOwnProperty.call(data, mappedField)) return data[mappedField];
  return null;
}

function normalizeDeclaredType(value: unknown): string {
  return text(value).toLowerCase().replace(/[\\s_-]+/g, '');
}

function isDeclaredNumeric(column: ArithmeticRelationshipColumn): boolean {
  const kind = normalizeDeclaredType(column.dataType);
  if (!kind) return true;
  if (NON_NUMERIC_TYPES.has(kind)) return false;
  return NUMERIC_TYPES.has(kind);
}

function distinctCount(values: number[]): number {
  return new Set(values.map((value) => Object.is(value, -0) ? '0' : String(value))).size;
}

function numericColumns(
  rows: ArithmeticRelationshipRow[],
  columns: ArithmeticRelationshipColumn[],
  mappedFieldCounts: Map<string, number>,
): NumericColumn[] {
  const seenNames = new Set<string>();
  return columns.flatMap((column, order) => {
    const name = text(column.name);
    if (!name || seenNames.has(name)) return [];
    seenNames.add(name);
    if (IDENTIFIER_HEADER.test(name) || !isDeclaredNumeric(column)) return [];
    const mappedField = text(column.mappedField);
    const values = rows.map((row) => parseNumber(rowValue(row, column, !mappedField || mappedFieldCounts.get(mappedField) === 1)));
    const nonEmpty = rows.filter((row) => {
      const value = rowValue(row, column, !mappedField || mappedFieldCounts.get(mappedField) === 1);
      return value !== null && value !== undefined && text(value) !== '';
    }).length;
    const valid = values.filter((value): value is number => value !== null && Number.isFinite(value));
    const coverage = nonEmpty ? valid.length / nonEmpty : 0;
    if (valid.length < ARITHMETIC_RELATIONSHIP_LIMITS.minimumRows || coverage < 0.9 || distinctCount(valid) < 3) return [];
    return [{
      ...column,
      index: Number.isInteger(column.index) ? Number(column.index) : order,
      values,
      validCount: valid.length,
      coverage,
    }];
  }).sort((a, b) =>
    Number(b.mappingConfidence ?? 0) - Number(a.mappingConfidence ?? 0)
    || b.coverage - a.coverage
    || a.index - b.index,
  );
}

function calculate(operation: ArithmeticOperation, left: number, right: number): number | null {
  if (operation === '+') return left + right;
  if (operation === '−') return left - right;
  if (operation === '×') return left * right;
  if (right === 0) return null;
  if (operation === '÷') return left / right;
  return (left / right) * 100;
}

function formulaFor(output: string, left: string, right: string, operation: ArithmeticOperation): string {
  const expression = operation === '%' ? '(' + left + ' ÷ ' + right + ') × 100' : left + ' ' + operation + ' ' + right;
  return output + ' = ' + expression;
}

/**
 * Finds observed arithmetic relationships in complete canonical source rows.
 * A candidate is supported only when it matches every discovery and independent
 * validation observation. This does not recover or recalculate workbook formulas.
 */
export function inferArithmeticRelationships(input: {
  rows: ArithmeticRelationshipRow[];
  columns: ArithmeticRelationshipColumn[];
  expectedRowCount?: number;
}): ArithmeticRelationshipInference {
  const rows = Array.isArray(input.rows) ? input.rows : [];
  const sourceRows = rows.length;
  const expected = Number.isInteger(input.expectedRowCount) && Number(input.expectedRowCount) >= 0
    ? Number(input.expectedRowCount)
    : sourceRows;
  const empty = (status: ArithmeticRelationshipInference['status'], reason: string | null): ArithmeticRelationshipInference => ({
    status,
    reason,
    limits: { ...ARITHMETIC_RELATIONSHIP_LIMITS },
    sourceRows,
    sampledRows: 0,
    numericColumns: 0,
    testedEquations: 0,
    omittedCandidates: 0,
    truncated: false,
    candidates: [],
  });

  if (expected !== sourceRows) return empty('partial_source', 'SOURCE_ROWS_INCOMPLETE');
  if (sourceRows < ARITHMETIC_RELATIONSHIP_LIMITS.minimumRows) return empty('insufficient', 'INSUFFICIENT_SOURCE_ROWS');

  const sampleCount = Math.min(sourceRows, ARITHMETIC_RELATIONSHIP_LIMITS.rows);
  const samples = Array.from({ length: sampleCount }, (_, sampleIndex) => {
    const sourceIndex = Math.floor(sampleIndex * sourceRows / sampleCount);
    const row = rows[sourceIndex];
    return {
      sampleIndex,
      row: Number.isInteger(row?.row_number) ? Number(row.row_number) : sourceIndex + 1,
      data: row?.data ?? null,
    };
  });
  const mappedFieldCounts = new Map<string, number>();
  for (const column of input.columns) {
    const field = text(column.mappedField);
    if (field) mappedFieldCounts.set(field, (mappedFieldCounts.get(field) ?? 0) + 1);
  }
  const profiles = numericColumns(samples, input.columns, mappedFieldCounts);
  const selectedColumns = profiles.slice(0, ARITHMETIC_RELATIONSHIP_LIMITS.columns);
  const result: ArithmeticRelationshipInference = {
    status: selectedColumns.length < 3 ? 'unavailable' : 'evaluated',
    reason: selectedColumns.length < 3 ? 'FEWER_THAN_THREE_NUMERIC_COLUMNS' : null,
    limits: { ...ARITHMETIC_RELATIONSHIP_LIMITS },
    sourceRows,
    sampledRows: sampleCount,
    numericColumns: profiles.length,
    testedEquations: 0,
    omittedCandidates: 0,
    truncated: profiles.length > selectedColumns.length || sourceRows > sampleCount,
    candidates: [],
  };
  if (result.status !== 'evaluated') return result;

  const observationsFor = (output: NumericColumn, left: NumericColumn, right: NumericColumn, operation: ArithmeticOperation) => {
    const excludedRows: number[] = [];
    const observations: Observation[] = [];
    for (const sample of samples) {
      const a = parseNumber(rowValue({ data: sample.data }, left, !text(left.mappedField) || mappedFieldCounts.get(text(left.mappedField)) === 1));
      const b = parseNumber(rowValue({ data: sample.data }, right, !text(right.mappedField) || mappedFieldCounts.get(text(right.mappedField)) === 1));
      const actual = parseNumber(rowValue({ data: sample.data }, output, !text(output.mappedField) || mappedFieldCounts.get(text(output.mappedField)) === 1));
      const expectedValue = a === null || b === null ? null : calculate(operation, a, b);
      if (a === null || b === null || actual === null || expectedValue === null
        || ![a, b, actual, expectedValue].every(Number.isFinite)) {
        excludedRows.push(sample.row);
        continue;
      }
      const residual = Math.abs(actual - expectedValue);
      const tolerance = ARITHMETIC_RELATIONSHIP_LIMITS.absoluteTolerance
        + Math.max(Math.abs(actual), Math.abs(expectedValue)) * ARITHMETIC_RELATIONSHIP_LIMITS.relativeTolerance;
      observations.push({
        sampleIndex: sample.sampleIndex,
        row: sample.row,
        left: a,
        right: b,
        actual,
        expected: expectedValue,
        residual,
        matches: residual <= tolerance,
      });
    }
    return { observations, excludedRows };
  };

  const operations: ArithmeticOperation[] = ['+', '−', '×', '÷', '%'];
  for (const output of selectedColumns) {
    for (const left of selectedColumns) {
      for (const right of selectedColumns) {
        if (new Set([output.index, left.index, right.index]).size !== 3) continue;
        for (const operation of operations) {
          if ((operation === '+' || operation === '×') && left.index > right.index) continue;
          result.testedEquations += 1;
          const { observations, excludedRows } = observationsFor(output, left, right, operation);
          if (observations.length < ARITHMETIC_RELATIONSHIP_LIMITS.minimumRows) continue;

          const discovery = observations.filter((item) => item.sampleIndex % 3 !== 2);
          const validation = observations.filter((item) => item.sampleIndex % 3 === 2);
          if (discovery.length < 8 || validation.length < 4) continue;
          if ([left, right, output].some((column, index) => {
            const key = index === 0 ? 'left' : index === 1 ? 'right' : 'actual';
            return distinctCount(discovery.map((item) => item[key])) < 3;
          })) continue;

          const discoveryMatches = discovery.filter((item) => item.matches).length;
          if (discoveryMatches / discovery.length < 0.9) continue;
          const validationMatches = validation.filter((item) => item.matches).length;
          const candidate: ArithmeticRelationshipCandidate = {
            formula: formulaFor(output.name, left.name, right.name, operation),
            columns: [output.name, left.name, right.name],
            indexes: [output.index, left.index, right.index],
            operation,
            status: discoveryMatches === discovery.length && validationMatches === validation.length ? 'supported' : 'counterexamples',
            discovery: { rows: discovery.map((item) => item.row), matches: discoveryMatches, sampleSize: discovery.length },
            validation: { rows: validation.map((item) => item.row), matches: validationMatches, sampleSize: validation.length },
            excludedRows,
            maxResidual: Math.max(...observations.map((item) => item.residual)),
            counterexamples: observations.filter((item) => !item.matches).slice(0, 8).map((item) => ({
              row: item.row,
              actual: item.actual,
              expected: item.expected,
              residual: item.residual,
            })),
          };
          if (result.candidates.length < ARITHMETIC_RELATIONSHIP_LIMITS.results) result.candidates.push(candidate);
          else {
            result.omittedCandidates += 1;
            result.truncated = true;
          }
        }
      }
    }
  }

  result.candidates.sort((a, b) =>
    Number(b.status === 'supported') - Number(a.status === 'supported')
    || (b.validation.matches / Math.max(1, b.validation.sampleSize)) - (a.validation.matches / Math.max(1, a.validation.sampleSize))
    || (b.discovery.matches / Math.max(1, b.discovery.sampleSize)) - (a.discovery.matches / Math.max(1, a.discovery.sampleSize))
    || a.formula.localeCompare(b.formula),
  );
  return result;
}

function relationSignalId(candidate: ArithmeticRelationshipCandidate): string {
  return 'arithmetic:relationship:' + candidate.indexes.join('-') + ':' + candidate.operation;
}

function signalFor(candidate: ArithmeticRelationshipCandidate): ReportSignal {
  const supported = candidate.status === 'supported';
  const sampleRows = candidate.validation.rows.slice(0, 6).join(',');
  return {
    id: relationSignalId(candidate),
    severity: supported ? 'low' : 'medium',
    title: supported ? 'علاقة حسابية مدعومة بعينة تحقق مستقلة' : 'علاقة حسابية مرشحة تحتاج مراجعة',
    message: supported
      ? 'تطابقت العلاقة ' + candidate.formula + ' في عينة الاكتشاف والتحقق المستقلة.'
      : 'ظهرت العلاقة ' + candidate.formula + ' في الاكتشاف، لكنها لم تتطابق بالكامل في التحقق المستقل؛ راجع الصفوف المخالفة.',
    evidence: [
      'formula=' + candidate.formula,
      'discovery=' + candidate.discovery.matches + '/' + candidate.discovery.sampleSize,
      'validation=' + candidate.validation.matches + '/' + candidate.validation.sampleSize,
      'validationSourceRows=' + sampleRows,
      'maxResidual=' + candidate.maxResidual.toFixed(6),
      ...(candidate.counterexamples.length ? ['counterexamples=' + candidate.counterexamples.map((item) => item.row).join(',')] : []),
    ],
    affectedRows: candidate.counterexamples.length,
    soWhat: 'تكشف العلاقة نمطًا حسابيًا مرصودًا بين حقول المصدر، ولا تثبت وحدها معنى الحقول أو سبب النتيجة.',
    impact: 'لا يُستنتج أثر مالي أو تشغيلي من العلاقة وحدها؛ يلزم التحقق من تعريف الحقول ووحداتها.',
    ownerHint: 'محلل البيانات أو المراجع المالي',
    priority: supported ? 'P3' : 'P2',
    priorityReason: supported
      ? ['اجتازت العلاقة اختبارًا مستقلاً على صفوف لم تستخدم في الاكتشاف.']
      : ['لم تتكرر العلاقة بالكامل في عينة التحقق المستقلة.'],
  };
}

function recommendationFor(candidate: ArithmeticRelationshipCandidate): ReportRecommendation {
  const supported = candidate.status === 'supported';
  return {
    id: 'rec:' + relationSignalId(candidate),
    status: 'PROPOSED',
    priority: supported ? 'low' : 'medium',
    title: supported ? 'مراجعة واعتماد معنى العلاقة الحسابية' : 'مراجعة الصفوف المخالفة للعلاقة الحسابية',
    action: supported
      ? 'تحقق من تعريف الحقول ووحداتها في المصدر، ثم وثّق ما إذا كانت العلاقة تمثل قاعدة عمل معتمدة.'
      : 'افحص الصفوف المخالفة ووحدات القياس والاستثناءات قبل اعتماد أي معادلة أو تعديل بيانات.',
    why: 'النتيجة مشتقة من قيم الصفوف الفعلية، وليست من اسم الملف أو صيغة مفترضة.',
    evidence: [
      candidate.formula,
      'discovery=' + candidate.discovery.matches + '/' + candidate.discovery.sampleSize,
      'validation=' + candidate.validation.matches + '/' + candidate.validation.sampleSize,
      'sourceRows=' + candidate.validation.rows.slice(0, 6).join(','),
    ],
    ownerHint: 'محلل البيانات أو المراجع المالي',
    impact: 'تحسين فهم بنية المؤشرات؛ لا يوجد أثر مالي مثبت من اكتشاف العلاقة وحده.',
    expectedOutcome: 'تحديد ما إذا كانت العلاقة قاعدة تجارية صحيحة أو استثناءً يحتاج تفسيرًا موثقًا.',
    whyNow: supported ? 'العلاقة تكررت على عينة مستقلة.' : 'ظهرت أمثلة مخالفة بين الاكتشاف والتحقق.',
    measurement: 'نسبة الصفوف المطابقة في التحقق المستقل وعدد الاستثناءات التي تم تفسيرها.',
    risk: 'قد تتشابه الحقول حسابيًا دون أن تكون مرتبطة دلاليًا أو محاسبيًا.',
    blocker: 'يلزم اعتماد تعريف الحقول والوحدات من مالك البيانات قبل استخدامها في قرار مالي.',
    limitation: 'لا تعيد هذه العملية حساب صيغ Excel الأصلية، ولا تثبت السببية أو السياسة المحاسبية.',
  };
}

function findingFor(candidate: ArithmeticRelationshipCandidate): BusinessFinding {
  const supported = candidate.status === 'supported';
  return {
    id: relationSignalId(candidate),
    kind: supported ? 'FINDING' : 'RISK',
    priority: supported ? 'low' : 'medium',
    title: supported ? 'نمط حسابي مدعوم' : 'تعارض في نمط حسابي مرشح',
    statement: candidate.formula + (supported ? ' — اجتازت عينة التحقق المستقلة.' : ' — توجد صفوف مخالفة في عينة التحقق المستقلة.'),
    value: null,
    unit: 'observed_relationship',
    dimensionLabel: 'العلاقة الحسابية',
    dimensionValue: candidate.operation,
    evidence: [
      'discovery=' + candidate.discovery.matches + '/' + candidate.discovery.sampleSize,
      'validation=' + candidate.validation.matches + '/' + candidate.validation.sampleSize,
      'sourceRows=' + candidate.validation.rows.slice(0, 6).join(','),
    ],
    limitation: 'النمط الحسابي المرصود لا يثبت معنى الحقول أو المعادلة الأصلية أو الأثر المالي.',
    action: supported
      ? 'راجع قاموس الحقول ووحدات القياس قبل توثيق العلاقة كقاعدة عمل.'
      : 'راجع الصفوف المخالفة وتحقق من الاستثناءات أو جودة البيانات.',
  };
}

/** Connects verified arithmetic observations to the existing Smart Report advice/evidence chain. */
export function addArithmeticRelationshipInsights(
  intelligence: ReportIntelligence,
  inference: ArithmeticRelationshipInference,
): ReportIntelligence {
  if (!inference.candidates.length) return intelligence;
  const signals = inference.candidates.map(signalFor);
  const recommendations = inference.candidates.map(recommendationFor);
  const findings = inference.candidates.map(findingFor);
  const supportedFindings = findings.filter((item) => item.kind === 'FINDING');
  const riskFindings = findings.filter((item) => item.kind === 'RISK');
  const inspect = [
    ...inference.candidates.slice(0, 8).map((item) =>
      item.formula + ' · اكتشاف ' + item.discovery.matches + '/' + item.discovery.sampleSize
      + ' · تحقق ' + item.validation.matches + '/' + item.validation.sampleSize),
    ...(inference.truncated ? ['تم تطبيق حدود فحص آمنة؛ بعض الأعمدة أو الصفوف لم تدخل في البحث.'] : []),
  ];
  return {
    ...intelligence,
    signals: [...intelligence.signals, ...signals],
    recommendations: [...intelligence.recommendations, ...recommendations],
    findings: [...intelligence.findings, ...supportedFindings],
    risks: [...intelligence.risks, ...riskFindings],
    guidance: {
      ...intelligence.guidance,
      inspect: [...intelligence.guidance.inspect, ...inspect],
    },
    advisorBrief: {
      ...intelligence.advisorBrief,
      topFinding: intelligence.advisorBrief.topFinding ?? supportedFindings[0] ?? riskFindings[0] ?? null,
      topRisk: intelligence.advisorBrief.topRisk ?? riskFindings[0] ?? null,
      recommendedAction: intelligence.advisorBrief.recommendedAction ?? recommendations[0]?.action ?? null,
      ownerHint: intelligence.advisorBrief.ownerHint || 'محلل البيانات أو المراجع المالي',
      measurement: intelligence.advisorBrief.measurement ?? recommendations[0]?.measurement ?? null,
    },
  };
}
