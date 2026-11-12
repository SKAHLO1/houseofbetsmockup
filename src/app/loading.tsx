/** Route-level loading state, shaped like what arrives: a title, then a grouped match list with price columns. */
export default function Loading() {
  return (
    <div className="page" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton--title" />
      <div className="skeleton-group">
        <div className="skeleton-group__head">
          <span className="skeleton skeleton--text" />
        </div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton-group__row">
            <span className="skeleton skeleton--when" />
            <span className="skeleton-group__teams">
              <span className="skeleton skeleton--text" />
              <span className="skeleton skeleton--text skeleton--short" />
            </span>
            <span className="skeleton-group__odds">
              <span className="skeleton skeleton--odds" />
              <span className="skeleton skeleton--odds" />
              <span className="skeleton skeleton--odds" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
