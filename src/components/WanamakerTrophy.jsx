export function WanamakerTrophy() {
  return (
    <div className="wanamaker-trophy" aria-hidden="true">
      <svg viewBox="0 0 260 320" role="img" className="h-full w-full">
        <defs>
          <linearGradient id="trophyGold" x1="70" x2="196" y1="18" y2="288" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff4b8" />
            <stop offset="0.3" stopColor="#f5c84b" />
            <stop offset="0.62" stopColor="#b97812" />
            <stop offset="1" stopColor="#ffe08a" />
          </linearGradient>
          <linearGradient id="trophyShadow" x1="42" x2="214" y1="58" y2="272" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff8cf" stopOpacity="0.9" />
            <stop offset="0.38" stopColor="#e4a526" stopOpacity="0.72" />
            <stop offset="1" stopColor="#6f3f06" stopOpacity="0.55" />
          </linearGradient>
          <filter id="trophyGlow" x="-40%" y="-30%" width="180%" height="170%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.97 0 1 0 0 0.68 0 0 1 0 0.18 0 0 0 0.42 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#trophyGlow)" opacity="0.95">
          <path
            d="M83 72c-22 6-43 23-49 51-7 31 10 57 39 72"
            fill="none"
            stroke="url(#trophyShadow)"
            strokeLinecap="round"
            strokeWidth="18"
          />
          <path
            d="M177 72c22 6 43 23 49 51 7 31-10 57-39 72"
            fill="none"
            stroke="url(#trophyShadow)"
            strokeLinecap="round"
            strokeWidth="18"
          />
          <path
            d="M72 58h116l-11 94c-5 41-27 63-47 63s-42-22-47-63L72 58Z"
            fill="url(#trophyGold)"
            stroke="#fff0a8"
            strokeWidth="4"
          />
          <path
            d="M91 77h78l-7 68c-4 34-18 50-32 50s-28-16-32-50L91 77Z"
            fill="rgba(255,255,255,0.16)"
          />
          <path d="M96 215h68l-7 44h-54l-7-44Z" fill="url(#trophyGold)" stroke="#fff0a8" strokeWidth="4" />
          <path d="M72 258h116l18 34H54l18-34Z" fill="url(#trophyGold)" stroke="#fff0a8" strokeWidth="4" />
          <path d="M82 292h96" stroke="#fff6bf" strokeLinecap="round" strokeWidth="5" />
          <path d="M84 53c15-16 77-16 92 0" fill="none" stroke="#fff0a8" strokeLinecap="round" strokeWidth="8" />
          <path d="M113 102h34M107 125h46M111 148h38" stroke="#6b3d07" strokeLinecap="round" strokeOpacity="0.36" strokeWidth="5" />
        </g>
      </svg>
    </div>
  );
}
