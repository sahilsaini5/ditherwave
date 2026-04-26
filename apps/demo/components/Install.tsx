'use client';
import { useState } from 'react';

const CMD: Record<string, string> = {
  npm: 'npm install ditherwave',
  pnpm: 'pnpm add ditherwave',
  yarn: 'yarn add ditherwave',
  bun: 'bun add ditherwave',
};

export default function Install() {
  const [pm, setPm] = useState<keyof typeof CMD>('npm');
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(CMD[pm]!);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <div className="pm-tabs">
        {Object.keys(CMD).map((k) => (
          <button key={k} className={pm === k ? 'active' : ''} onClick={() => setPm(k as keyof typeof CMD)}>
            {k}
          </button>
        ))}
      </div>
      <div className="code-block" style={{ padding: '18px 20px', fontSize: 14 }}>
        <button className="copy" onClick={copy}>{copied ? 'copied' : 'copy'}</button>
        <span className="token-punct">$ </span>
        <span>{CMD[pm]}</span>
      </div>
    </div>
  );
}
