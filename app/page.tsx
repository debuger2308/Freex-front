
"use client"

import { useTheme } from "next-themes"
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
                
            }}>
                logout
            </button>

        </main>
    )
}
