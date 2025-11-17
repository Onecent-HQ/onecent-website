import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt = 'Supershares - An exclusive network of investors shaping the future of on-chain finance';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Read the logo file and convert to base64
  let logoDataUrl = '';
  try {
    const logoPath = join(process.cwd(), 'public', 'assets', 'logos', 'Logo_2 Background Removed.png');
    const logoBuffer = await readFile(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    logoDataUrl = `data:image/png;base64,${logoBase64}`;
  } catch (error) {
    console.error('Failed to load logo for OG image:', error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.10), transparent 60%),
            linear-gradient(135deg, #000000 0%, #0A0A0A 50%, #000000 100%)
          `,
        }}
      >
        {/* Frosted black card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 40,
            padding: '56px 80px',
            borderRadius: 36,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow:
              '0 40px 120px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255,255,255,0.02)',
            backgroundImage:
              'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.82))',
            backdropFilter: 'blur(18px)',
            maxWidth: 1040,
          }}
        >
          {/* Logo */}
          {logoDataUrl ? (
            <div
              style={{
                width: 220,
                height: 220,
                borderRadius: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'radial-gradient(circle at 30% 0%, rgba(255,255,255,0.10), transparent 55%)',
              }}
            >
              <img
                src={logoDataUrl}
                alt="Supershares Logo"
                width={180}
                height={180}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : null}

          {/* Text Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 22,
            }}
          >
            {/* Silver Badge */}
            <div
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.18)',
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(0,0,0,0.4))',
                fontSize: 16,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#D0D0D0',
              }}
            >
              EXCLUSIVE INVESTOR NETWORK
            </div>

            {/* Main Title (Silver / Platinum gradient) */}
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                background:
                  'linear-gradient(120deg, #FFFFFF 0%, #E5E5E5 40%, #BFBFBF 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              Supershares
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 28,
                color: '#C9C9C9',
                maxWidth: 640,
                lineHeight: 1.4,
                fontWeight: 300,
              }}
            >
              An exclusive network of investors shaping the future of on-chain
              finance.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}

