
export interface IAuthInfo {
    isAuth: boolean
    token: string
    userdata: {
        nickname: string
        id: number
    }
}