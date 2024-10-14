import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode';


export async function middleware(req: NextRequest) {
    const response = NextResponse.next()


    const cookieStore = cookies()
    let authInfo: { isAuth: boolean, token: string } = JSON.parse(cookieStore.get('auth-info')?.value || '{}')

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: req.headers
    })
    
    if (backendRes.status === 201) {
        const data = await backendRes.json()
        response.headers.set('Set-Cookie', `${backendRes.headers.getSetCookie()}`)
        response.cookies.set('auth-info', JSON.stringify({
            isAuth: true,
            userdata: jwtDecode(data.token),
            token: data.token
        }), { maxAge: 1000 * 60, httpOnly: true, secure: true })
    }
    else {
        response.cookies.set('auth-info', JSON.stringify({
            isAuth: false,
            token: ''
        }), { maxAge: 1000 * 60, httpOnly: true, secure: true })
        authInfo.isAuth = false
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