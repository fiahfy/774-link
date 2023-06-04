import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export function middleware(req: NextRequest) {
  req.nextUrl.pathname = `/maintenance`

  return NextResponse.rewrite(req.nextUrl)
}
