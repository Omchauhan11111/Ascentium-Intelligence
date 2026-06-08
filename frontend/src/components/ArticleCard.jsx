import { ExternalLink, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_STYLES = {
  news:       { label: 'News',       cls: 'tag-news',       accent: 'bg-blue-500'    },
  govt:       { label: 'Govt',       cls: 'tag-govt',       accent: 'bg-emerald-500' },
  competitor: { label: 'Competitor', cls: 'tag-competitor', accent: 'bg-orange-500'  },
  evergreen:  { label: 'Evergreen',  cls: 'tag-evergreen',  accent: 'bg-violet-500'  },
};

export default function ArticleCard({
  item,
  compact    = false,
  selectable = false,
  selected   = false,
  onSelect,
  adminActions = null,
}) {
  const t    = TYPE_STYLES[item.type] || TYPE_STYLES.news;
  const when = item.fetchedAt
    ? formatDistanceToNow(new Date(item.fetchedAt), { addSuffix: true })
    : '';

  return (
    <article
      className={[
        'card group relative flex flex-col hover:shadow-lift transition-all duration-200 fade-in',
        'rounded-lg',                          /* keep corners */
        compact ? 'p-3' : 'p-4',
        selected ? 'ring-2 ring-brass-400' : '',
      ].join(' ')}
    >
      {/* Left colour accent — positioned so it stays inside rounded corners */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg ${t.accent} opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      {/* Tags row */}
      <div className="flex items-center justify-between gap-2 mb-2 pl-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <span className={`tag ${t.cls} shrink-0`}>{t.label}</span>
          {item.category && item.category !== 'General' && (
            <span className="text-[10px] text-ink-400 uppercase tracking-wider font-medium truncate">
              {item.category}
            </span>
          )}
        </div>
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect?.(item._id)}
            className="rounded border-ink-200 text-navy-900 focus:ring-navy-700/30 mt-0.5 shrink-0"
          />
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-[14px] sm:text-[15px] leading-snug text-ink-800 group-hover:text-navy-900 transition-colors mb-2 pl-3">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline decoration-brass-400 underline-offset-2 line-clamp-3"
        >
          {item.title}
        </a>
      </h3>

      {/* Summary */}
      {(item.summary || item.aiSummary) && (
        <p className="text-[12px] sm:text-[13px] text-ink-500 leading-relaxed mb-3 pl-3 line-clamp-2 flex-1">
          {item.summary || item.aiSummary}
        </p>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-2 pl-3 mt-auto pt-2 border-t border-ink-50">
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-ink-400 min-w-0">
          <span className="font-medium text-ink-500 truncate max-w-[100px] sm:max-w-none">
            {item.source}
          </span>
          {when && (
            <span className="flex items-center gap-1 shrink-0">
              <Calendar size={10} />{when}
            </span>
          )}
          {item.subcategory && (
            <span className="hidden lg:flex items-center gap-1 shrink-0">
              <Tag size={10} />{item.subcategory}
            </span>
          )}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-300 hover:text-brass-500 transition-colors shrink-0"
          title="Open source"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Admin actions */}
      {adminActions && (
        <div className="mt-3 pt-3 border-t border-ink-100 flex flex-wrap gap-2 pl-3">
          {adminActions}
        </div>
      )}
    </article>
  );
}
