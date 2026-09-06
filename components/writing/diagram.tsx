export function DiagramNode({
  label,
  detail,
  strong = false,
  dashed = false,
  className = "",
}: {
  label: string;
  detail?: string;
  strong?: boolean;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border px-3 py-3 ${
        strong ? "border-faint bg-surface text-fg" : "border-line text-muted"
      } ${dashed ? "border-dashed" : ""} ${className}`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em]">
        {label}
      </p>
      {detail ? (
        <p
          className={`mt-1 text-[12px] leading-[1.45] ${
            strong ? "text-fg" : "text-muted"
          }`}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}
