/**
 * Label/value pairs as a description list.
 * @param {{ entries: [string, React.ReactNode][] }} props
 */
export function MetadataList({ entries }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      {entries.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-500">{label}</dt>
          <dd className="text-right text-ink-900 tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
