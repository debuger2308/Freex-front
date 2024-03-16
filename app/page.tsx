
"use client"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"



export default function Home() {
    const router = useRouter()


    return (
        <main>
            <form action={async (formData) => {

                async function getAuthInfo() {
                    const res = await fetch('/api/auth/get-session', {
                        method: 'GET'
                    })
                    const json = await res.json()
                    const authInfo = JSON.parse(json.value)
                    if (res.status === 200) return authInfo
                    return null
                }
                const authInfo: { isAuth: boolean, token: string } = await getAuthInfo()

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/set-image`, {
                    body: formData,
                    method: 'POST',
                    headers: {
                        'authorization': `Bearer ${authInfo.token}`,
                    },
                    credentials: "include"
                })
            }}>
                <input type="file" name="profileImage" />
                <button>submit</button>
            </form>
            

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

            }}>
                logout
            </button>

        </main>
    )
}
