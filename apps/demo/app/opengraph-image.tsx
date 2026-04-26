import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ditherwave — a tiny WebGL dithering primitive for React';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'radial-gradient(ellipse at 30% 30%, rgba(57,255,20,0.18), transparent 55%), #050605',
          color: '#c8ffd5',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 22, color: '#39ff14', letterSpacing: '0.08em', display: 'flex' }}>
          $ npm install ditherwave
        </div>
        <div
          style={{
            fontSize: 180,
            fontWeight: 700,
            lineHeight: 0.95,
            marginTop: 32,
            letterSpacing: '-0.06em',
            display: 'flex',
            color: '#c8ffd5',
          }}
        >
          <span style={{ color: '#39ff14' }}>dither</span>
          <span style={{ color: '#4a7a58' }}>wave</span>
        </div>
        <div style={{ fontSize: 28, marginTop: 36, color: '#8aa49a', display: 'flex' }}>
          a tiny WebGL2 dithering primitive for React. 7.6kb gz. zero deps. MIT.
        </div>
      </div>
    ),
    { ...size }
  );
}
