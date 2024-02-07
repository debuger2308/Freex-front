
import { cookies } from 'next/headers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { IAuthInfo } from '@/interfaces/IAuthInfo'

export async function POST(req: Request, res: NextApiResponse) {

    const data: IAuthInfo = await req.json()

    cookies().set('auth-info', JSON.stringify(data), { maxAge: 1000 * 60 })
    return new Response("Created", {
        status: 201,
    })
}