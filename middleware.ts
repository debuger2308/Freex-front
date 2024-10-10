import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode';

const allowedOrigins = ['https://acme.com', 'https://my-app.org']

const corsOptions = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function middleware(req: NextRequest) {

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
    const response = NextResponse.next()
    if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
    }
    Object.entries(corsOptions).forEach(([key, value]) => {
        response.headers.set(key, value)
    })


    let res = NextResponse.next()

    const cookieStore = cookies()
    let authInfo: { isAuth: boolean, token: string } = JSON.parse(cookieStore.get('auth-info')?.value || '{}')

    const headers = new Headers()
    headers.set('cookie', `${req.headers.get("cookie")}`)
    if (authInfo && authInfo.isAuth === true) {
        const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: headers
        })

        if (backendRes.status === 201) {

            const data = await backendRes.json()

            res = NextResponse.next({
                headers: new Headers({ 'Set-Cookie': `${backendRes.headers.getSetCookie()}` }),
            })
            res.cookies.set('auth-info', JSON.stringify({
                isAuth: true,
                userdata: jwtDecode(data.token),
                token: data.token
            }), { maxAge: 1000 * 60, httpOnly: true })
            authInfo.isAuth = true
        }
        else {
            res.cookies.set('auth-info', JSON.stringify({
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

    return res
}

export const config = {
    matcher: ['/auth/login', '/auth/registration', '/', '/userdata', '/spin', '/chats'],
}