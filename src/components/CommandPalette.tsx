import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Command, Search } from 'lucide-react';
import { NAVIGATION_ITEMS, type NavigationItem, type NavigationSectionId } from '@/lib/navigation-registry';

type CommandItem = Pick<NavigationItem, 'label' | 'description' | 'path' | 'keywords' | 'section'>;

const COMMANDS: CommandItem[] = NAVIGATION_ITEMS;

type CommandCategory = 'ظ…ط±ظƒط² ط§ظ„ظ‚ط±ط§ط±' | 'ط§ظ„ط¨ظٹط§ظ†ط§طھ ظˆط§ظ„طھط´ط؛ظٹظ„' | 'ط§ظ„طھط­ظ„ظٹظ„ ط§ظ„طھط¬ط§ط±ظٹ' | 'ط§ظ„ط°ظƒط§ط، ظˆط§ظ„ظ‚ط±ط§ط±' | 'ط§ظ„ط«ظ‚ط© ظˆط§ظ„ط£ط¯ظ„ط©' | 'ط§ظ„طھظ‚ط§ط±ظٹط± ظˆط§ظ„ظ…ط®ط±ط¬ط§طھ' | 'ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط±ط¬ط¹ظٹط©' | 'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ';

const COMMAND_CATEGORY_LABELS: Record<string, CommandCategory> = {
  'decision-center': 'ظ…ط±ظƒط² ط§ظ„ظ‚ط±ط§ط±',
  'data-operations': 'ط§ظ„ط¹ظ…ظ„ ظˆط§ظ„ط¨ظٹط§ظ†ط§طھ',
  analytics: 'ط§ظ„طھط­ظ„ظٹظ„ ط§ظ„طھط¬ط§ط±ظٹ',
  intelligence: 'ط§ظ„ط°ظƒط§ط، ظˆط§ظ„ط§ط³طھظƒط´ط§ظپ',
  reference: 'ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط±ط¬ط¹ظٹط©',
  admin: 'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ظˆط§ظ„طھط¬ظ‡ظٹط²',
};

function commandCategory(section: NavigationSectionId): CommandCategory {
  return COMMAND_CATEGORY_LABELS[section];
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const RECENT_COMMANDS_KEY = 'aghbari.commandPalette.recent';
const RECENT_LIMIT = 5;

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);

  const recentCommands = useMemo(
    () => recentPaths.map(path => COMMANDS.find(item => item.path === path)).filter((item): item is CommandItem => Boolean(item)),
    [recentPaths],
  );

  const contextScore = useCallback((path: string) => {
    const current = location.pathname;
    if (path === current) return 100;
    if (path !== '/' && current.startsWith(path + '/')) return 80;
    const currentRoot = current.split('/').filter(Boolean)[0];
    const itemRoot = path.split('/').filter(Boolean)[0];
    if (currentRoot && currentRoot === itemRoot) return 45;
    return 0;
  }, [location.pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matches = COMMANDS.filter(item =>
      !q || [item.label, item.description, ...item.keywords].join(' ').toLowerCase().includes(q),
    );

    return [...matches].sort((a, b) => {
      if (!q) {
        const recentDelta = Number(recentPaths.includes(b.path)) - Number(recentPaths.includes(a.path));
        if (recentDelta !== 0) return recentDelta;
      }

      const contextDelta = contextScore(b.path) - contextScore(a.path);
      if (contextDelta !== 0) return contextDelta;

      if (q) {
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        const aPrefix = Number(aLabel.startsWith(q));
        const bPrefix = Number(bLabel.startsWith(q));
        if (aPrefix !== bPrefix) return bPrefix - aPrefix;
      }

      return a.label.localeCompare(b.label, 'ar');
    });
  }, [contextScore, query, recentPaths]);

  const openCommand = useCallback((item: CommandItem) => {
    const next = [item.path, ...recentPaths.filter(path => path !== item.path)].slice(0, RECENT_LIMIT);
    setRecentPaths(next);
    try {
      window.localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(next));
    } catch {
      // Optional persistence; navigation remains functional.
    }
    navigate(item.path);
    onClose();
  }, [navigate, onClose, recentPaths]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    try {
      const raw = window.localStorage.getItem(RECENT_COMMANDS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setRecentPaths(parsed.filter((path): path is string => typeof path === 'string').slice(0, RECENT_LIMIT));
      }
    } catch {
      // Optional persistence; command palette remains functional.
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(value => Math.min(value + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(value => Math.max(value - 1, 0));
      }
      if (event.key === 'Enter' && filtered[active]) {
        event.preventDefault();
        openCommand(filtered[active]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, filtered, onClose, open, openCommand]);

  if (!open) return null;

  return (
    <div className="ag-command-overlay fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/45 px-4 pt-[10vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="ظ„ظˆط­ط© ط§ظ„ط£ظˆط§ظ…ط±">
      <button className="absolute inset-0 cursor-default" aria-label="ط¥ط؛ظ„ط§ظ‚" onClick={onClose} />
      <div className="ag-command-palette relative w-full max-w-3xl overflow-hidden rounded-[18px] border border-ink-200 bg-white shadow-2xl" dir="rtl">
        <div className="ag-command-search flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
          <Search size={19} className="text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={event => { setQuery(event.target.value); setActive(0); }}
            placeholder="ط§ط¨ط­ط« ط¹ظ† طµظپط­ط© ط£ظˆ ط¥ط¬ط±ط§ط،..."
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
            aria-label="ط§ظ„ط¨ط­ط« ظپظٹ ط§ظ„ط£ط؛ط¨ط±ظٹ"
            aria-autocomplete="list"
            aria-controls="command-results"
            aria-activedescendant={filtered[active] ? `command-option-${active}` : undefined}
          />
          <kbd className="hidden rounded-md border border-ink-200 bg-ink-50 px-2 py-1 text-[10px] text-ink-400 sm:inline-flex">Esc</kbd>
        </div>

        <div id="command-results" className="max-h-[55vh] overflow-y-auto p-2" role="listbox" aria-label="ظ†طھط§ط¦ط¬ ظ„ظˆط­ط© ط§ظ„ط£ظˆط§ظ…ط±">
          {!query.trim() && recentCommands.length > 0 && (
            <div className="mb-2">
              <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wide text-ink-400">ط§ظ„ظˆطµظˆظ„ ط§ظ„ط³ط±ظٹط¹</div>
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-1">
                {recentCommands.map(item => {
                  const index = filtered.findIndex(row => row.path === item.path);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      onMouseEnter={() => setActive(Math.max(index, 0))}
                      onClick={() => openCommand(item)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-primary-900 transition hover:bg-white"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary-700"><Command size={15}/></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.label}</span>
                        <span className="block truncate text-[11px] text-primary-700/65">{item.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!query.trim() && (
            <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-wide text-ink-400">ظ…ط±طھط¨ط· ط¨ظ…ط§ طھط¹ظ…ظ„ ط¹ظ„ظٹظ‡ ط§ظ„ط¢ظ†</div>
          )}

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-400">ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©</div>
          ) : (
            filtered.map((item, index) => {
              const isCurrent = contextScore(item.path) >= 45;
              return (
                <button
                  key={item.path}
                  id={`command-option-${index}`}
                  role="option"
                  aria-selected={index === active}
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => openCommand(item)}
                  className={`ag-command-result flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${index === active ? 'ag-command-result-active bg-primary-50 text-primary-900' : 'hover:bg-ink-50'}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index === active ? 'bg-primary-100 text-primary-700' : 'bg-ink-100 text-ink-500'}`}><Command size={17}/></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="block min-w-0 truncate text-sm font-semibold">{item.label}</span>
                      <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[9px] font-bold text-ink-500">{commandCategory(item.section)}</span>
                      {!query.trim() && isCurrent && <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[9px] font-bold text-primary-700">ظپظٹ ظ‡ط°ظ‡ ط§ظ„ظ…ط³ط§ط­ط©</span>}
                    </span>
                    <span className="block truncate text-xs text-ink-400">{item.description}</span>
                  </span>
                  {index === active && <ArrowRight size={16} className="shrink-0 text-primary-500" />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 bg-ink-50/70 px-4 py-2 text-[11px] text-ink-400">
          <span>â†‘â†“ ظ„ظ„طھظ†ظ‚ظ„</span><span>Enter ظ„ظ„ظپطھط­</span><span>Esc ظ„ظ„ط¥ط؛ظ„ط§ظ‚</span>
        </div>
      </div>
    </div>
  );
}

