
import { cookies, headers } from 'next/headers'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, res: NextApiResponse) {

    return new Response("Updated", {
        status: 201,
    })



}