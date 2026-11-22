export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}

export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[#242433] bg-[#111118] p-1"
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={`min-h-[36px] rounded-md px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#7C3AED] text-white'
                : 'text-[#B8B8CA] hover:bg-[#181822] hover:text-[#F8F8FA]'
            }`}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span className="ml-1.5 font-mono tabular-nums opacity-80">({item.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
