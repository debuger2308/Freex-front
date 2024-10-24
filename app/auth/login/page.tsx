"use client"
import Link from 'next/link';
import './auth.css'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IUserCredentials } from '@/interfaces/IUserCredentials';


const Auth = () => {

    async function restApiLogin(user: IUserCredentials) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                body: JSON.stringify(user),
                method: 'POST',
                headers: {
                    "Content-type": "application/json",
                },
                credentials: "include",
                mode: 'cors'
            })
            return res
        } catch (error) {
            console.log(error);
        }
    }

    async function nextApiLogin(data: { token: string }) {
        const nextApiResponse = await fetch('/api/auth/login', {
            body: JSON.stringify({
                isAuth: true,
                token: data.token
            }),
            method: 'POST',
            headers: {
                "Content-type": "application/json",
            },
            credentials: 'include',
        })
        return nextApiResponse
    }

    const [authErrors, setAuthErros] = useState('')
    const [isDataLoading, setIsDataLoading] = useState(false)

    const router = useRouter()

    return (
        <main className="auth">

            <div className="auth__container">
                <div className="auth__content">
                    <h1 className='auth__title'>Freex</h1>
                    <div className="auth__content-text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem, quam sapiente. Tempora quas natus pariatur deserunt esse vero nesciunt numquam?</div>
                </div>

                <form

                    action={async (formData) => {
                        setAuthErros('')
                        setIsDataLoading(true)
                        const user = {
                            nickname: String(formData.get('nickname')),
                            password: String(formData.get('password'))
                        }
                        const restApiResponse = await restApiLogin(user)

                        if (restApiResponse?.status === 401 || restApiResponse?.status === 406) {
                            setAuthErros('Wrong nickname or password')
                        }
                        else if (restApiResponse?.status === 201) {
                            const json = await restApiResponse?.json()
                            const apiResponse = await nextApiLogin(json)
                            if (apiResponse.status === 201) router.refresh()
                        }
                        setIsDataLoading(false)
                    }}
                    className="auth__form"
                >

                    <div className="input-field">
                        <input
                            onChange={() => {
                                setAuthErros('')
                            }}
                            type="text"
                            id='nickname'
                            name="nickname"
                            className='input'
                            placeholder=' '
                            required />
                        <label htmlFor="nickname" className="input-label">Nickname</label>
                    </div>
                    <div className="input-field">
                        <input
                            onChange={() => {
                                setAuthErros('')
                            }}
                            type="password"
                            id='password'
                            name="password"
                            placeholder=' '
                            className='input'
                            required />
                        <label htmlFor="password" className="input-label">Password</label>
                    </div>

                    <div className="auth__errors">
                        <strong className='auth__error'>{authErrors}</strong>
                    </div>

                    <button
                        type="submit"
                        className="auth__submit-btn"
                        disabled={isDataLoading}
                    >
                        Log In
                    </button>
                    <Link href="/reset-password" className='auth__link-reset-pass'>
                        Forgot password?
                    </Link>

                    <hr className='auth__decoration-line' />

                    <Link href="/auth/registration" className='auth__link-create-user'>
                        Create new account
                    </Link>
                </form>


            </div>

        </main>
    );
}

export default Auth;