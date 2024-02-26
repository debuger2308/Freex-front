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
                else router.refresh()
            }
            else router.refresh()
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            imageRendering="optimizeQuality"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            viewBox="0 0 512 511.01"
                            className={`gender__svg ${genderChecked === 'man' && 'gender__svg--active'} `}
                        >
                            <path
                                fillRule="nonzero"
                                d="m456.72 96.62-115.49 115.5c22.46 31.03 35.72 69.17 35.72 110.41 0 52.04-21.1 99.17-55.2 133.27-34.11 34.1-81.23 55.21-133.28 55.21-52.03 0-99.17-21.11-133.27-55.21C21.1 421.7 0 374.57 0 322.53c0-52.04 21.1-99.17 55.2-133.27 34.1-34.1 81.23-55.21 133.27-55.21 42.91 0 82.47 14.35 114.16 38.5L419.89 55.28h-62.84V0H512v158.91h-55.28V96.62zM282.66 228.35c-24.1-24.1-57.41-39.02-94.19-39.02s-70.08 14.92-94.18 39.02c-24.1 24.1-39.01 57.4-39.01 94.18 0 36.78 14.91 70.09 39.01 94.19 24.1 24.1 57.4 39.01 94.18 39.01 36.78 0 70.09-14.91 94.19-39.01 24.1-24.1 39.01-57.41 39.01-94.19s-14.91-70.08-39.01-94.18z"
                            />
                        </svg>

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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            shapeRendering="geometricPrecision"
                            textRendering="geometricPrecision"
                            imageRendering="optimizeQuality"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            viewBox="0 0 361 511.42"
                            className={`gender__svg ${genderChecked === 'woman' && 'gender__svg--active'} `}
                        >
                            <path
                                fillRule="nonzero"
                                d="M203.64 359.53v44.17h78.58v52.94h-78.58v54.78H150.7v-54.78H72.13V403.7h78.57v-45.15c-37.91-6.3-71.82-24.41-97.83-50.42C20.21 275.47 0 230.35 0 180.5c0-49.84 20.21-94.97 52.87-127.63S130.65 0 180.5 0c49.84 0 94.97 20.21 127.63 52.87S361 130.66 361 180.5c0 49.84-20.21 94.97-52.87 127.63-27.52 27.52-63.9 46.2-104.49 51.4zM270.7 90.3c-23.08-23.08-54.98-37.36-90.2-37.36-35.23 0-67.12 14.28-90.2 37.36s-37.36 54.98-37.36 90.2c0 35.23 14.28 67.12 37.36 90.2s54.97 37.36 90.2 37.36c35.22 0 67.12-14.28 90.2-37.36s37.36-54.97 37.36-90.2c0-35.22-14.28-67.12-37.36-90.2z"
                            />
                        </svg>

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