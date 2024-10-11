
import { cookies, headers } from 'next/headers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export async function POST(req: NextRequest, res: NextApiResponse) {

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: new Headers(req.headers)
    })

    if (backendRes.status === 201) {
        const data = await backendRes.json()
        cookies().set('auth-info', JSON.stringify({
            isAuth: true,
            userdata: jwtDecode(data.token),
            token: data.token
        }), { maxAge: 1000 * 60 })
    }
    else {
        return new Response("Unauthorized", {
            status: 401,
        })
    }

    return Response.json(cookies().get('auth-info'))

}