
"use client"

import { useRouter } from "next/navigation"



export default function Home() {
    const router = useRouter()


    return (
        <main>
            <button onClick={async () => {


                const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                })

                const resApi = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                })
                if (resApi.status == 200) router.refresh()
                
                // const res = await fetch(`/api/auth/login`, {
                //     method: 'POST',
                //     credentials: 'include',
                // })
                // router.refresh()
            }}>
                logout
            </button>

        </main>
    )
}
