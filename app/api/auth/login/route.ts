
import { cookies } from 'next/headers'
import { IAuthInfo } from '@/interfaces/IAuthInfo'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: Response) {

    const data: IAuthInfo = await req.json()
    const setCookieHeader = req.headers.get('set-cookie');

    const response = new NextResponse("Created", {
        status: 201,
    });
    if (setCookieHeader) {
        response.headers.set('Set-Cookie', setCookieHeader);
    }
    cookies().set('auth-info', JSON.stringify(data), {
        maxAge: 1000 * 60,
        httpOnly: true,
        secure: true,
    })
    return response
}