"use client"
import { useEffect, useRef, useState } from 'react'
import './userdata.css'
import { IAuthInfo } from '@/interfaces/IAuthInfo'
import { IUserDataDto } from '@/interfaces/IUserDataDto'
import { useRouter } from 'next/navigation'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

async function getAuthInfo() {
    const res = await fetch('/api/auth/get-session', {
        method: 'GET'
    })
    const json = await res.json()
    const authInfo = JSON.parse(json.value)
    if (res.status === 200) return authInfo
    return null
}

async function getUserData(authInfo: IAuthInfo) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/get-user-data`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}

async function refreshToken() {
    const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
    })
    return await res.json()
}

const UserData = () => {
    const router = useRouter()

    const [userData, setUserData] = useState<IUserDataDto>()

    const [description, setDescription] = useState('')

    const [coord, setCoord] = useState('')

    const [genderChecked, setGenderChecked] = useState('')

    const geolocation = navigator.geolocation

    const descInputRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        async function setData() {
            const authInfo: { isAuth: boolean, token: string } = await getAuthInfo()
            if (authInfo && authInfo.isAuth && authInfo.token) {
                const res = await getUserData(authInfo)
                if (res.status === 200) {
                    const data = await res.json()
                    setUserData(data)
                    setGenderChecked(data.gender)
                }
                else if (res.status === 403) {
                    const refreshRes: RequestCookie | undefined = await refreshToken()
                    const refreshAuthInfo = JSON.parse(refreshRes?.value || "{}")
                    const res = await getUserData(refreshAuthInfo)
                    if (res.status === 200) {
                        const data = await res.json()
                        setUserData(data)
                        setGenderChecked(data.gender)
                    }
                    else router.refresh()
                }
            }
        }
        setData()

        geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            let coord = latitude + ' ' + longitude
            setCoord(coord)
        }, (e) => {
            console.log(e.code);
        })

    }, [])


    return (
        <main className="userdata">
            <div className="userdata__container">

                <form
                    className="userdata__form"
                    action={async (formData) => {

                        const authInfo: { isAuth: true, token: string } = await getAuthInfo()
                        if (String(formData.get('coordinats')).length === 0) {
                            return null
                        }

                        const data = {
                            age: Number(formData.get('age')),
                            location: String(formData.get('coordinats')),
                            city: String(formData.get('city')),
                            gender: String(formData.get('gender')),
                            description: String(formData.get('description')),
                            name: String(formData.get('name')),
                        }

                        if (authInfo && authInfo.isAuth && authInfo.token) {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/set-data`, {
                                method: 'PUT',
                                credentials: 'include',
                                headers: {
                                    'authorization': `Bearer ${authInfo.token}`,
                                    'Content-type': 'application/json'
                                },
                                body: JSON.stringify(data)
                            })
                            if (res.status === 403) {
                                const refreshRes = await refreshToken()
                                const refreshJson = await refreshRes.json()
                                const refreshAuthInfo = JSON.parse(refreshJson.value)
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/set-data`, {
                                    method: 'PUT',
                                    credentials: 'include',
                                    headers: {
                                        "authorization": `Bearer ${refreshAuthInfo.token}`,
                                        'Content-type': 'application/json'
                                    },
                                    body: JSON.stringify(data)
                                })
                            }
                            else router.refresh()
                        }


                    }}
                >

                    <input
                        type="text"
                        value={coord}
                        className='coord-input'
                        name='coordinats'
                        readOnly
                        required
                    />

                    <div className="input-field">
                        <input
                            type="text"
                            defaultValue={userData?.name || ''}
                            name='name'
                            id='name'
                            className='input'
                            maxLength={20}
                            placeholder=''
                        />
                        <label htmlFor="name" className='input-label'>
                            Name

                        </label>
                    </div>


                    <div className="input-field">
                        <input
                            type="text"
                            defaultValue={userData?.city || ''}
                            name='city'
                            id='city'
                            className='input'
                            maxLength={20}
                            placeholder=''
                        />
                        <label htmlFor="city" className='input-label'>
                            City

                        </label>
                    </div>


                    <div className="input-field">
                        <input
                            type="number"
                            defaultValue={userData?.age || ''}
                            name='age'
                            id='age'
                            className='input userdata__input-age'
                            placeholder=''
                            min="18"
                            max="100"
                        />
                        <label htmlFor="age" className='input-label'>
                            Age
                        </label>
                    </div>

                    <div className="input-field content-div__field">
                        <div
                            ref={descInputRef}
                            suppressContentEditableWarning={true}
                            className="input userdata__content-div"
                            contentEditable="true"
                            onBlur={(e) => setDescription(e.currentTarget.textContent || '')}
                        >
                            {userData?.description}
                        </div>
                        <input
                            id='description'
                            type="text"
                            className='input userdata__input-desc'
                            name='description'
                            value={description || userData?.description || ''}
                            readOnly
                            placeholder=''
                        />
                        <label
                            className="input-label userdata-label--ContentEdit"
                            onClick={() => descInputRef.current?.focus()}
                            htmlFor="description"
                        >
                            Description
                        </label>
                    </div>


                    <div className="gender-wrapper input">

                        <label htmlFor="gender-man" className='gender__label'>
                            <input
                                onChange={(e) => setGenderChecked(e.currentTarget.value)}
                                type="radio"
                                name='gender'
                                id='gender-man'
                                className='gender__input'
                                value='man'
                                checked={genderChecked === 'man'}
                            />
                            Man
                        </label>

                        <label htmlFor="gender-woman" className='gender__label'>
                            <input
                                onChange={(e) => setGenderChecked(e.currentTarget.value)}
                                type="radio"
                                name='gender'
                                id='gender-woman'
                                className='gender__input'
                                value='woman'
                                checked={genderChecked === 'woman'}
                            />
                            Woman
                        </label>
                    </div>

                    <button
                        type='submit'
                        className='userdata__form-btn'>
                        Save
                    </button>
                </form>
            </div>
        </main>
    );
}

export default UserData;