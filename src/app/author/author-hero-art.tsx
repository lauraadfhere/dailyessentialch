"use client";

import { useState, type CSSProperties } from "react";

const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default function AuthorHeroArt() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="author-hero-art" onPointerMove={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      setPosition({ x: (event.clientX - bounds.left) / bounds.width - .5, y: (event.clientY - bounds.top) / bounds.height - .5 });
    }} onPointerLeave={() => setPosition({ x: 0, y: 0 })} style={{ "--pointer-x": position.x, "--pointer-y": position.y } as CSSProperties} aria-label="A field of letters that follows the pointer">
      <div className="author-letter-orbit" aria-hidden="true">
        {letters.map((letter, index) => <span key={`${letter}-${index}`} style={{ "--letter-index": index } as CSSProperties}>{letter}</span>)}
      </div>
      <span className="author-hero-art-caption">ALPHABET EARTH</span>
    </div>
  );
}

export function AuthorPen() {
  return (
    <svg className="author-pen-mark" viewBox="0 0 112 184" fill="none" aria-hidden="true">
        <path d="m76 16 20 20-48 96-27 13 7-28L76 16Z" fill="#1b1b1b" />
        <path d="m80 12 20 20-10 20-20-20 10-20Z" fill="#f7f4eb" />
        <path d="m28 117 20 20-19 9-10-10 9-19Z" fill="#a28d00" />
        <path d="m19 136 10 10-17 22 7-32Z" fill="#1b1b1b" />
        <path d="m36 104 21 21" stroke="#f2d600" strokeWidth="5" />
    </svg>
  );
}
