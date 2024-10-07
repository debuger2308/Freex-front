import { IAuthInfo } from "@/interfaces/IAuthInfo"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"

export async function getAuthInfo() {
    const res = await fetch('/api/auth/get-session', {
        method: 'GET'
    })
    const json = await res.json()
    const authInfo: IAuthInfo = JSON.parse(json.value)
    if (res.status === 200) return authInfo
    return null
}
export async function refreshToken() {
    const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
    })
    return await res.json()
}


export async function requestWrapper(
    requset: (authInfo: IAuthInfo, body?: any) => Promise<Response>,
    response: (data: any) => any,
    reject: () => any,
    body?: any
) {
    const authInfo: IAuthInfo | null = await getAuthInfo()
    if (authInfo && authInfo.isAuth && authInfo.token) {
        const res = await requset(authInfo, body)
        if (res.status === 200) {
            const data = await res.json()
            response(data)
            return data
        }
        else if (res.status === 403) {
            const refreshRes: RequestCookie | undefined = await refreshToken()
            const refreshAuthInfo = JSON.parse(refreshRes?.value || "{}")
            const res = await requset(refreshAuthInfo, body)
            if (res.status === 200) {
                const data = await res.json()
                response(data)
                return data
            }
            else reject()
        }
        else reject()
    }
}