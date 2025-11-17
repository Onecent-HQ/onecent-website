import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Supershares - An exclusive network of investors shaping the future of on-chain finance';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 50%, #B3B3B3 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            Supershares
          </div>
          <div
            style={{
              fontSize: '32px',
              color: '#B3B3B3',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: '1.4',
              fontWeight: '300',
            }}
          >
            An exclusive network of investors shaping the future of on-chain finance
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

