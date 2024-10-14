
import { cookies } from 'next/headers'
import { IAuthInfo } from '@/interfaces/IAuthInfo'
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, ) {

    const data: IAuthInfo = await req.json()

    cookies().set('auth-info', JSON.stringify(data), { maxAge: 1000 * 60 })
    return new Response("Created", {
        status: 201,
    })
}