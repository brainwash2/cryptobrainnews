import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export const runtime = 'edge';
 
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title')?.slice(0, 100) || 'CryptoBrainNews';
  const category = searchParams.get('category') || 'MARKET';
  const source = searchParams.get('source') || 'CryptoBrainNews';
 
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#050505',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Grid background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(250,191,44,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,191,44,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
 
        {/* Category badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px',
        }}>
          <div style={{
            background: '#FABF2C', color: '#000', fontSize: '14px',
            fontWeight: 900, padding: '6px 14px', letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            {category.toUpperCase()}
          </div>
          <div style={{ color: '#555', fontSize: '13px', letterSpacing: '4px', textTransform: 'uppercase' }}>
            {source}
          </div>
        </div>
 
        {/* Title */}
        <div style={{
          color: '#ffffff', fontSize: title.length > 60 ? '42px' : '52px',
          fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px',
          textTransform: 'uppercase', flex: 1,
          display: 'flex', alignItems: 'center',
        }}>
          {title}
        </div>
 
        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid #1a1a1a', paddingTop: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#FABF2C', color: '#000', fontSize: '12px',
              fontWeight: 900, padding: '4px 10px',
            }}>CB</div>
            <div style={{ color: '#888', fontSize: '14px', fontWeight: 700, letterSpacing: '2px' }}>
              CRYPTOBRAINNEWS
            </div>
          </div>
          <div style={{ color: '#FABF2C', fontSize: '13px', letterSpacing: '2px' }}>
            cryptobrainnews.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
