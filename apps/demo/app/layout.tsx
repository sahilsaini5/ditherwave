import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ditherwave.vercel.app'),
  title: 'ditherwave — a tiny WebGL dithering primitive for React',
  description:
    'Wrap any image, video, or canvas in <Dither>, or drop in <DitheredWaves> for an animated grainy background. Bayer, halftone, ASCII, and error-diffusion modes. Under 8kb gzipped, zero dependencies.',
  openGraph: {
    title: 'ditherwave',
    description: 'A tiny WebGL dithering primitive for React.',
    type: 'website',
  },
};

const noscriptStyle = `
  body { background: #050605; color: #c8ffd5; font-family: ui-monospace, "JetBrains Mono", monospace; }
  .noscript-fallback {
    min-height: 100svh; display: grid; place-items: center; padding: 32px; text-align: center;
  }
  .noscript-fallback h1 { color: #39ff14; font-size: 32px; margin: 0 0 12px; letter-spacing: -0.04em; }
  .noscript-fallback p { color: #4a7a58; max-width: 520px; line-height: 1.7; font-size: 13px; }
  .noscript-fallback a { color: #39ff14; }
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <noscript>
          <style>{noscriptStyle}</style>
          <div className="noscript-fallback">
            <div>
              <h1>ditherwave</h1>
              <p>
                this demo needs JavaScript and WebGL2 to render its dithered backgrounds.
                the library itself is on{' '}
                <a href="https://www.npmjs.com/package/ditherwave">npm</a>{' '}
                and{' '}
                <a href="https://github.com/sahilsaini5/ditherwave">github</a>.
              </p>
            </div>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
