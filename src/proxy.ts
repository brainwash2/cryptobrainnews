import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const acceptHeader = request.headers.get('accept') || '';
  const url = request.nextUrl.clone();

  // Content Negotiation: If an AI agent requests JSON for a human page, 
  // rewrite them to the equivalent Oracle API endpoint.
  if (acceptHeader.includes('application/json')) {
    // Example: /airdrops/protocol-name -> /api/oracle/airdrops/protocol-name
    if (url.pathname.startsWith('/airdrops') && !url.pathname.startsWith('/api')) {
      url.pathname = `/api/oracle${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    // Example: /news/article-id -> /api/oracle/news/article-id
    if (url.pathname.startsWith('/news') && !url.pathname.startsWith('/api')) {
      url.pathname = `/api/oracle${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher:[
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
