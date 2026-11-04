type LearningArtProps = {
  quote: string;
  accent: string;
};

export function LearningArt({ quote, accent }: LearningArtProps) {
  const accentIndex = accent ? quote.toLowerCase().indexOf(accent.toLowerCase()) : -1;
  const before = accentIndex >= 0 ? quote.slice(0, accentIndex) : quote;
  const highlighted = accentIndex >= 0 ? quote.slice(accentIndex, accentIndex + accent.length) : "";
  const after = accentIndex >= 0 ? quote.slice(accentIndex + accent.length) : "";

  return (
    <div className="home-learning-art">
      <svg viewBox="0 0 240 320" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="320" fill="#0b4ea2" />

        <g stroke="#fff" strokeWidth="4" strokeLinecap="round">
          <path d="M204 158 216 146" />
          <path d="M214 188h14" />
          <path d="M206 210l11 9" />
          <path d="M56 170 44 160" />
          <path d="M44 196H31" />
        </g>

        <path
          d="M30 8h180a22 22 0 0 1 22 22v52a22 22 0 0 1-22 22h-82l-28 28 4-28H30a22 22 0 0 1-22-22V30A22 22 0 0 1 30 8Z"
          fill="#fff"
          stroke="#111"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        <path d="M84 198 L66 170 L90 178 L78 152 L102 170 L102 146 L122 166 L130 140 L142 166 L156 146 L160 172 L178 158 L180 184 L192 180 L188 200 Z" fill="#111" />

        <path d="M88 188 C88 238 106 268 127 282 C148 268 166 238 166 188 Z" fill="#fff" stroke="#111" strokeWidth="4.5" strokeLinejoin="round" />
        <circle cx="170" cy="224" r="8.5" fill="#fff" stroke="#111" strokeWidth="4" />

        <g stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M99 190q9-6 18-1" />
          <path d="M139 189q9-5 18 1" />
          <path d="M125 210q3-4 6 0" />
          <path d="M128 224l-7 14 9 1" />
          <path d="M115 254q13 11 26 0" />
        </g>

        <circle cx="110" cy="214" r="17" fill="#fff" stroke="#111" strokeWidth="4.5" />
        <circle cx="146" cy="214" r="17" fill="#fff" stroke="#111" strokeWidth="4.5" />

        <path d="M96 286q31-12 62 0v34H96Z" fill="#111" />
        <path d="M122 287q6 9 12 0" stroke="#f7f4eb" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        <path d="M58 214q0-7 7-7t7 7v46H58Z" fill="#fff" stroke="#111" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M44 262q-6-20 16-22h26q15 2 15 22v22q0 18-18 18H62q-18 0-18-18Z" fill="#fff" stroke="#111" strokeWidth="4.5" strokeLinejoin="round" />
      </svg>
      <p className="home-learning-art-quote">
        <span>
          {before}
          {highlighted && <span className="home-learning-art-accent">{highlighted}</span>}
          {after}
        </span>
      </p>
    </div>
  );
}
