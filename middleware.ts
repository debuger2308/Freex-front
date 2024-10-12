import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode';

const allowedOrigins = ['*']

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function middleware(req: NextRequest) {
    const response = NextResponse.next()
    const origin = req.headers.get('origin') ?? ''
    const isAllowedOrigin = allowedOrigins.includes(origin)
    const isPreflight = req.method === 'OPTIONS'
    if (isPreflight) {
        const preflightHeaders = {
            ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
            ...corsOptions,
        }
        return NextResponse.json({}, { headers: preflightHeaders })
    }
    if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
    }
    Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value)
    })

    const cookieStore = cookies()
    let authInfo: { isAuth: boolean, token: string } = JSON.parse(cookieStore.get('auth-info')?.value || '{}')

    if (authInfo && authInfo.isAuth === true) {
        try {
            const headers = new Headers()
            headers.set('cookie', `${req.headers.get("cookie")}`)
            const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: headers
            })

            if (backendRes.status === 201) {
                const data = await backendRes.json()
                response.headers.set('Set-Cookie', `${backendRes.headers.getSetCookie()}`)
                response.cookies.set('auth-info', JSON.stringify({
                    isAuth: true,
                    userdata: jwtDecode(data.token),
                    token: data.token
                }), { maxAge: 1000 * 60, httpOnly: true })
            }
            else {
                response.cookies.set('auth-info', JSON.stringify({
                    isAuth: false,
                    token: ''
                }), { maxAge: 1000 * 60, httpOnly: true })
                authInfo.isAuth = false
            }
        } catch (error) {
            console.log(error);
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