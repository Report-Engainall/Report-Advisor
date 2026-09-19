export type SchemaDriftSeverity = 'none' | 'review' | 'blocking';

export interface SchemaColumn {
  name: string;
  type: string;
  required?: boolean;
}

export interface SchemaDriftResult {
  added: SchemaColumn[];
  removed: SchemaColumn[];
  changed: Array<{ previous: SchemaColumn; current: SchemaColumn }>;
  stable: SchemaColumn[];
  severity: SchemaDriftSeverity;
  autoMapSafe: boolean;
}

export function compareSchemas(previous: SchemaColumn[], current: SchemaColumn[]): SchemaDriftResult {
  const oldMap = new Map(previous.map(column => [column.name.trim().toLowerCase(), column]));
  const newMap = new Map(current.map(column => [column.name.trim().toLowerCase(), column]));
  const added = current.filter(column => !oldMap.has(column.name.trim().toLowerCase()));
  const removed = previous.filter(column => !newMap.has(column.name.trim().toLowerCase()));
  const changed = current.flatMap(column => {
    const old = oldMap.get(column.name.trim().toLowerCase());
    return old && old.type !== column.type ? [{ previous: old, current: column }] : [];
  });
  const stable = current.filter(column => {
    const old = oldMap.get(column.name.trim().toLowerCase());
    return !!old && old.type === column.type;
  });
  const severity = removed.some(column => column.required) || changed.some(item => item.previous.required)
    ? 'blocking'
    : added.length || changed.length
      ? 'review'
      : 'none';
  return {
    added,
    removed,
    changed,
    stable,
    severity,
    autoMapSafe: severity === 'none' || (severity === 'review' && removed.length === 0 && changed.length === 0),
  };
}
