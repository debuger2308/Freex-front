"use client"
import { useEffect, useRef, useState } from 'react'
import './userdata.css'
import { IAuthInfo } from '@/interfaces/IAuthInfo'
import { IUserDataDto } from '@/interfaces/IUserDataDto'
import { useRouter } from 'next/navigation'

async function getAuthInfo() {
    const res = await fetch('/api/auth/get-token', {
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
    return res
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
            const authInfo: { isAuth: true, token: string } = await getAuthInfo()
            if (authInfo && authInfo.isAuth && authInfo.token) {
                const res = await getUserData(authInfo)
                if (res.status === 200) {
                    const data = await res.json()
                    setUserData(data)
                    setGenderChecked(data.gender)
                }
                else if (res.status === 403) {
                    await refreshToken()
                    const res = await getUserData(authInfo)
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
    // console.log(userData);

    return (
        <main className="userdata">
            <div className="userdata__container">
                <h1 className='userdata__title'>Questionnaire</h1>

                <form
                    className="userdata__form"
                    action={async (formData) => {

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

                        const authInfo: { isAuth: true, token: string } = await getAuthInfo()
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

                    <label htmlFor="name" className='userdata-label'>
                        Name
                        <input
                            type="text"
                            defaultValue={userData?.name || ''}
                            name='name'
                            id='name'
                            className='userdata__input'
                            maxLength={20}
                        />
                    </label>

                    <label htmlFor="city" className='userdata-label'>
                        City
                        <input
                            type="text"
                            defaultValue={userData?.city || ''}
                            name='city'
                            id='city'
                            className='userdata__input'
                            maxLength={20}
                        />
                    </label>


                    <label htmlFor="age" className='userdata-label'>
                        Age
                        <input
                            type="number"
                            defaultValue={userData?.age || ''}
                            name='age'
                            id='age'
                            className='userdata__input userdata__input-age'
                        />
                    </label>

                    <label
                        className="userdata-label userdata-label--ContentEdit"
                        onClick={() => descInputRef.current?.focus()}
                    >
                        Description
                        <div
                            id='description'
                            ref={descInputRef}
                            suppressContentEditableWarning={true}
                            className="userdata__input userdata__content-div"
                            contentEditable="true"
                            onBlur={(e) => setDescription(e.currentTarget.textContent || '')}
                        >
                            {userData?.description}
                        </div>
                        <input
                            type="text"
                            className='userdata__input userdata__input-desc'
                            name='description'
                            value={description}
                            readOnly
                        />
                    </label>

                    <label htmlFor="gender" className='userdata-label'>
                        Gender
                        <div className="userdata-label__age">

                            <label htmlFor="gender-man" className='userdata__label-gender'>

                                <input
                                    onChange={(e) => setGenderChecked(e.currentTarget.value)}
                                    type="radio"
                                    name='gender'
                                    id='gender-man'
                                    className='userdata__input-gender'
                                    value='man'
                                    checked={genderChecked === 'man'}
                                />
                                Man
                            </label>

                            <label htmlFor="gender-woman" className='userdata__label-gender'>
                                <input
                                    onChange={(e) => setGenderChecked(e.currentTarget.value)}
                                    type="radio"
                                    name='gender'
                                    id='gender-woman'
                                    className='userdata__input-gender'
                                    value='woman'
                                    checked={genderChecked === 'woman'}
                                />
                                Woman
                            </label>
                        </div>
                    </label>

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