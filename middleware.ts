import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function middleware(req: NextRequest) {
    cookies
    const res = NextResponse.next()
    const cookieStore = cookies()
    const authInfo: { isAuth: boolean, token: string } = JSON.parse(cookieStore.get('auth-info')?.value || '{}')


    if (req.nextUrl.pathname === '/auth/login' && authInfo?.isAuth) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    if (req.nextUrl.pathname === '/auth/registration' && authInfo?.isAuth) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    console.log(authInfo);
    if (req.nextUrl.pathname !== '/auth/login' && !authInfo.isAuth) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
    }



}

export const config = {
    matcher: ['/auth/login', '/auth/registration', '/'],
}