export function Pineapple({ className = "h-6 w-6" }: { className?: string }) {
  // Discreet pineapple mark — Paloneo / Minah brand element.
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2c.6 1.4.5 2.6-.2 3.6 1.3-.4 2.5-.2 3.6.6-1.2.5-2 1.3-2.4 2.3M12 2c-.6 1.4-.5 2.6.2 3.6-1.3-.4-2.5-.2-3.6.6 1.2.5 2 1.3 2.4 2.3"
        stroke="#e38a21"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.5c3.3 0 5.5 2.2 5.5 6.2 0 3.5-2.4 6.3-5.5 6.3s-5.5-2.8-5.5-6.3c0-4 2.2-6.2 5.5-6.2Z"
        fill="#e38a21"
        fillOpacity="0.18"
        stroke="#e38a21"
        strokeWidth="1.4"
      />
      <path
        d="M9 11.5l3 3M15 11.5l-3 3M9.5 16l2.5-2.5L14.5 16M12 9.5v0"
        stroke="#e38a21"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
