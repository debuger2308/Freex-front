import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode';
import { IAuthInfo } from "./interfaces/IAuthInfo";


export async function middleware(req: NextRequest) {

    const response = NextResponse.next()

    const cookieStore = cookies()
    let authInfo: IAuthInfo = JSON.parse(cookieStore.get('auth-info')?.value || '{}')

    if (authInfo && authInfo.isAuth === true) {
        // const token: { nickname: string, id: number, exp: number, iat: number } = jwtDecode(authInfo.token)
        // console.log(token);
        const headers = new Headers()
        headers.set('cookie', `${req.headers.get("cookie")}`)
        const backendRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: headers
        })

        if (backendRes.status !== 200) {
            response.cookies.set('auth-info', JSON.stringify({
                isAuth: false,
                token: ''
            }), { maxAge: 1000 * 60, httpOnly: true })
            authInfo.isAuth = false
        }

    }

    if (req.nextUrl.pathname === '/auth/login' && authInfo?.isAuth) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    if (req.nextUrl.pathname === '/auth/registration' && authInfo?.isAuth) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    if (req.nextUrl.pathname !== '/auth/login' && !authInfo.isAuth) {
        if (req.nextUrl.pathname !== '/auth/registration') {
            return NextResponse.redirect(new URL("/auth/login", req.url))
        }
    }
    return response
}

export const config = {
    matcher: ['/auth/login', '/auth/registration', '/', '/userdata', '/spin', '/chats'],
}