"use client"
import { CSSProperties, useEffect, useState } from "react";
import "./SearchParamsForm.css"
import DoubleRangeInput from "../doubleRangeInput/DoubleRangeInput";
import RangeInput from "../rangeInput/RangeInput";
import { IAuthInfo } from "@/interfaces/IAuthInfo";
import { useRouter } from "next/navigation";
import { ISearchParams } from "@/interfaces/ISearchParams";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import Skeleton from "../skeleton/Skeleton";

const inputStyles: CSSProperties = {
    borderBottom: '1px dashed var(--shadowcolor)'
}

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
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/search-params/get-params`, {
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

const SearchParamsForm = () => {

    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [actionIsLoading, setActionIsLoading] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    const [genderChecked, setGenderChecked] = useState('')
    const [minAge, setMinAge] = useState(18)
    const [maxAge, setMaxAge] = useState(99)
    const [distance, setDistance] = useState(100)

    useEffect(() => {
        if (isLoaded === true) {
            setTimeout(() => {
                setIsLoaded(false)
            }, 1500)
        }

    }, [isLoaded])

    useEffect(() => {
        async function setData() {
            setIsLoading(true)
            const authInfo: { isAuth: boolean, token: string } = await getAuthInfo()
            if (authInfo && authInfo.isAuth && authInfo.token) {
                const res = await getUserData(authInfo)
                if (res.status === 200) {
                    const data: ISearchParams = await res.json()
                    setGenderChecked(data.gender || '')
                    setMinAge(data.minAge || 18)
                    setMaxAge(data.maxAge || 99)
                    setDistance(data.distance || 999)
                }
                else if (res.status === 403) {
                    const refreshRes: RequestCookie | undefined = await refreshToken()
                    const refreshAuthInfo = JSON.parse(refreshRes?.value || "{}")
                    const res = await getUserData(refreshAuthInfo)
                    if (res.status === 200) {
                        const data = await res.json()
                        setGenderChecked(data.gender || '')
                        setMinAge(data.minAge || 18)
                        setMaxAge(data.maxAge || 99)
                        setDistance(data.distance || 999)
                    }
                    else router.refresh()
                }
            }
            setIsLoading(false)
        }
        setData()
    }, [])

    return (
        <form
            className="searh-p-form"
            action={async (formData) => {
                const authInfo: { isAuth: true, token: string } = await getAuthInfo()
                setActionIsLoading(true)
                const data: ISearchParams = {
                    distance: Number(distance),
                    gender: String(formData.get('gender')),
                    maxAge: Number(maxAge),
                    minAge: Number(minAge)
                }
                if (authInfo && authInfo.isAuth && authInfo.token) {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search-params/set-params`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: {
                            'authorization': `Bearer ${authInfo.token}`,
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })

                    if (res.status === 200) setIsLoaded(true)
                    if (res.status === 403) {
                        const refreshRes = await refreshToken()
                        const refreshJson = await refreshRes
                        const refreshAuthInfo = JSON.parse(refreshJson.value)
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search-params/set-params`, {
                            method: 'PUT',
                            credentials: 'include',
                            headers: {
                                "authorization": `Bearer ${refreshAuthInfo.token}`,
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        })
                        if (res.status === 200) setIsLoaded(true)
                    }
                    else router.refresh()
                }
                setActionIsLoading(false)

            }}
        >


            {isLoading ?
                <Skeleton height='61px' styles={inputStyles} />
                : <div className="gender-wrapper" style={inputStyles}>

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

            }
            {isLoading ?
                <Skeleton height='146px' styles={inputStyles} />
                : <DoubleRangeInput
                    min={18}
                    max={99}
                    setActualMaxValue={setMaxAge}
                    setActualMinValue={setMinAge}
                    minValue={minAge}
                    maxValue={maxAge}
                    title="Age"
                    styles={inputStyles}
                />

            }
            {isLoading ?
                <Skeleton height='146px' styles={inputStyles} />
                : <RangeInput
                    min={0}
                    max={999}
                    setValue={setDistance}
                    value={distance}
                    title="Distance"
                    styles={inputStyles}
                />

            }

            {isLoading ?
                <Skeleton height='61px' styles={inputStyles} />
                : <button
                    type='submit'
                    className={`userdata__form-btn ${isLoaded && 'userdata__form-btn--activated'}`}
                    disabled={actionIsLoading}
                    onClick={(e) => {
                        if (isLoaded) e.preventDefault()
                    }}
                >
                    {isLoaded
                        ? "Saved!"
                        : actionIsLoading
                            ? <>
                                Saving...
                            </>
                            : "Save"
                    }


                </button>
            }

        </form>
    );
}

export default SearchParamsForm;