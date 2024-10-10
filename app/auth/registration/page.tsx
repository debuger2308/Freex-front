"use client"
import Link from 'next/link';
import './registration.css'
import { IUserCredentials } from '@/interfaces/IUserCredentials';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


const Registration = () => {

    async function restApiRegistration(user: IUserCredentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/registration`, {
            body: JSON.stringify(user),
            method: 'POST',
            headers: {
                "Content-type": "application/json",
            },
            credentials: "include"
        })
        return res
    }

    async function nextApiLogin(data: { token: string }) {
        const nextApiResponse = await fetch('/api/auth/login', {
            body: JSON.stringify({
                isAuth: true,
                token: data.token
            }),
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
        })
        return nextApiResponse
    }

    const router = useRouter()

    const [formErr, setFormErr] = useState<string[]>([])
    const [nicknameErr, setNicknameErr] = useState(false)
    const [passErr, setPassErr] = useState(false)
    const [passReapeatErr, setRepeatPassErr] = useState(false)

    function clearErrors() {
        setFormErr([])
        setNicknameErr(false)
        setPassErr(false)
        setRepeatPassErr(false)
    }

    return (
        <main className="registration">
            <div className="registration__container">
                <h1 className="registration__logo">Freex</h1>
                <h3 className="registration__title">Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, hic!</h3>
                <form
                    onChange={clearErrors}
                    className='registration__form'
                    action={async (formData) => {
                       
                        if (String(formData.get('password')) !== String(formData.get('reapeat-password'))) {
                            setFormErr([...formErr, 'Password mismatch'])
                            setRepeatPassErr(true)
                            return null
                        }

                        const user = {
                            nickname: String(formData.get('nickname')),
                            password: String(formData.get('password'))
                        }
                        const restApiResponse = await restApiRegistration(user)

                        if (restApiResponse.status === 201) {
                            const json = await restApiResponse.json()
                            const apiResponse = await nextApiLogin(json)
                            if (apiResponse.status === 201) router.refresh()
                        }
                        else if (restApiResponse.status === 406) {
                            const err: string[] = await restApiResponse.json()
                            setFormErr([...err])
                            if (err.includes('nickname - No less than four and no more than twelve')) setNicknameErr(true)
                            if (err.includes('password - No less than four and no more than sixteen')) setPassErr(true)
                        }
                        else if (restApiResponse.status === 409) {
                            setNicknameErr(true)
                            setFormErr([ 'User with this nickname already exist'])
                        }
                    }}
                >
                    <h3 className="form__title">Registration</h3>

                    <div className="input-field registration__input-field">
                        <input
                            type="text"
                            className={nicknameErr ? "input registration__input-err registration__input" : 'input registration__input'}
                            id='nickname'
                            name="nickname"
                            placeholder=' '
                            required
                        />

                        <label
                            htmlFor="nickname"
                            className={nicknameErr ? "input-label registration__input-label-err" : 'input-label'}
                        >
                            nickname
                        </label>
                    </div>



                    <div className="input-field registration__input-field">
                        <input
                            type="password"
                            className={passErr ? "input registration__input-err registration__input" : 'input registration__input'}
                            id='password'
                            name="password"
                            placeholder=' '
                            required
                        />

                        <label
                            htmlFor="password"
                            className={passErr ? "input-label registration__input-label-err" : 'input-label '}
                        >
                            Password
                        </label>
                    </div>



                    <div className="input-field registration__input-field">
                        <input
                            type="password"
                            className={passReapeatErr ? "input registration__input-err registration__input" : 'input registration__input'}
                            id='reapeat-password'
                            name="reapeat-password"
                            placeholder=' '
                            required
                        />

                        <label
                            htmlFor="reapeat-password"
                            className={passReapeatErr ? "input-label registration__input-label-err" : 'input-label '}
                        >
                            Repeat password
                        </label>
                    </div>



                    <button className="registration__sibmit-btn">
                        Sign In
                    </button>

                    {formErr.map((err, index) => {
                        return (
                            <strong className='auth__err' key={index}>
                                · {err}
                            </strong>
                        )
                    })}


                    <hr className='registration__decoration-line' />

                    <Link href="/auth/login" className='registration__link-login'>
                        Log In
                    </Link>
                </form>
            </div>
        </main>
    );
}

export default Registration;