/**
 * Housebets wordmark. Typeset stand-in that follows the brand's
 * accent-initial treatment; swap for the official logo file when available.
 */
export function Logo() {
  return (
    <span className="logo">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M2 17.500c2.500 0 2.500-2 5-2s2.500 2 5 2 2.500-2 5-2 2.500 2 5 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 12.500c.500-4.500 4-7.500 8.500-7.500 3 0 5.500 1.500 6.500 3.500-2-.800-4.500-.300-5.500 1.500s0 3.500 1.500 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="logo__word">
        <b>H</b>ousebets
      </span>
    </span>
  );
}
