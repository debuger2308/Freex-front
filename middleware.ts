import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode';


export async function middleware(req: NextRequest) {
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
            const userdata = jwtDecode(data.token)
            res.cookies.set('auth-info', JSON.stringify({
                isAuth: true,
                userdata: jwtDecode(data.token),
                token: data.token
            }), { maxAge: 1000 * 60, httpOnly: true })
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