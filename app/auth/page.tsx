"use client"
import Link from 'next/link';
import './auth.css'
import { useState } from 'react';

const Auth = () => {

    const [authErrors, setAuthErros] = useState('')
    const [isDataLoading, setIsDataLoading] = useState(false)

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
                            nickname: formData.get('nickname'),
                            password: formData.get('password')
                        }

                        try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                                method: "POST",
                                body: JSON.stringify(user),

                                headers: {
                                    "Content-Type": "application/json",

                                },
                            })
                            const json = await res.json()
                            if (res.status === 406 && json) {
                                setAuthErros('Wrong nickname or password')
                            }
                            if (res.status === 401 && json.message) {
                                setAuthErros(json.message)
                            }
                            if (res.status === 201) {
                                localStorage.setItem(process.env.NEXT_PUBLIC_LCSTORAGE_AUTH || '', JSON.stringify({
                                    isAuth: true,
                                    token: json.token
                                }))
                                console.log(json.token);
                            }
                        } catch (error) {
                            alert(error)
                        }
                        setIsDataLoading(false)
                    }}
                    className="auth__form"
                >

                    <div className="auth__input-field">
                        <input
                            onChange={() => {
                                setAuthErros('')
                            }}
                            type="text"
                            id='nickname'
                            name="nickname"
                            className='auth__input'
                            placeholder=' '
                            required />
                        <label htmlFor="nickname" className="auth__input-label">Nickname</label>
                    </div>
                    <div className="auth__input-field">
                        <input
                            onChange={() => {
                                setAuthErros('')
                            }}
                            type="password"
                            id='password'
                            name="password"
                            className='auth__input'
                            placeholder=' '
                            required />
                        <label htmlFor="password" className="auth__input-label">Password</label>
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

                    <Link href="/registration" className='auth__link-create-user'>
                        Create new account
                    </Link>
                </form>


            </div>



        </main>
    );
}

export default Auth;