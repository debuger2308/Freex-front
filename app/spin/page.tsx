'use client'
import SearchParamsForm from "@/components/searchParams/SearchParamsForm";
import SpinSlider from "@/components/slider/SpinSlider";
import './Spin.css'
import SpinCard from "@/components/spinCard/SpinCard";
import { useEffect, useState } from "react";
import { IAuthInfo } from "@/interfaces/IAuthInfo";
import { useRouter } from "next/navigation";
import { IUserDataDto } from "@/interfaces/IUserDataDto";
import { requestWrapper } from '@/functions/api/api'
import LastSpinCard from "@/components/lastSpinCard/LastSpinCard";
import { IVotedDate } from "@/interfaces/IVotedDate";




async function getUsersDataRequest(authInfo: IAuthInfo) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-data/get-users-data`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}

async function vote(authInfo: IAuthInfo, data: any) {
    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes/write-vote`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'authorization': `Bearer ${authInfo.token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res
}

const Spin = () => {
    const router = useRouter()
    const [usersData, setUsersData] = useState<IUserDataDto[]>([])
    const [blockUi, setBlockUi] = useState(false)
    const [votedCards, setVotedCards] = useState<IVotedDate[]>([])
    const [activeCardId, setActiveCardId] = useState(0)
    const [frontCard, setFrontCard] = useState<number>(0)
    const [likedCards, setLikedCard] = useState<number[]>([])
    const [dislikedCards, setDislikedCard] = useState<number[]>([])
    const [searchFormActive, setSearchFormActive] = useState(false)


    useEffect(() => {

        setData()
    }, [])
    useEffect(() => {
        const liked = votedCards.map((item) => {
            if (item.vote) return item.votedUserId
            else return NaN
        })
        const disliked = votedCards.map((item) => {
            if (!item.vote) return item.votedUserId
            else return NaN
        })
        setLikedCard(liked)
        setDislikedCard(disliked)

    }, [votedCards])
    useEffect(() => {
        if (frontCard === usersData.length) setActiveCardId(-1)
        else setActiveCardId(usersData[frontCard]?.userId)
    }, [frontCard, usersData])

    async function setData() {
        setBlockUi(true)

        // Upload data
        await requestWrapper(getUsersDataRequest, (data: { usersData: IUserDataDto[], usersIdVotes: IVotedDate[] }) => {
            const usersId = data.usersData.map(item => item.userId)
            const votedCards = data.usersIdVotes.filter(item => usersId.includes(item.votedUserId))

            setUsersData(data.usersData)
            setVotedCards(votedCards)
            setFrontCard(votedCards.length)
        }, () => { router.refresh() })


        setLikedCard([])
        setBlockUi(false)
    }

    // Scroll card to next
    function nextCard() {
        setFrontCard(prev => {
            if (frontCard < usersData.length) return prev + 1
            else return usersData.length
        })
    }
    // scroll card to prev
    function prevCard() {
        setFrontCard(prev => {
            if (frontCard > 0) return prev - 1
            else return 0
        })
    }


    
    async function dislike(id: number) {
        setBlockUi(true)
        if (id === -1) {
            router.push('/chats')
        }
        else {
            await requestWrapper(vote,
                () => { },
                () => { },
                { vote: false, votedUserId: usersData[frontCard]?.userId })
            setDislikedCard(prev => {
                if (!prev.includes(id)) return [...prev, id]
                else return prev
            })
            setLikedCard(prev => {
                if (prev.includes(id)) {
                    return prev.filter(item => item !== id)
                }
                return prev
            })
        }

        setBlockUi(false)
    }
    async function like(id: number) {
        setBlockUi(true)
        if (id === -1) {
            setData()
        }
        else {
            await requestWrapper(vote,
                () => { },
                () => { },
                { vote: true, votedUserId: usersData[frontCard]?.userId })
            setDislikedCard(prev => {
                if (prev.includes(id)) {
                    return prev.filter(item => item !== id)
                }
                return prev
            })
            setLikedCard(prev => {
                if (!prev.includes(id)) return [...prev, id]
                else return prev
            })
        }
        setBlockUi(false)
    }

    return (
        <main className="spin">
            <button
                onClick={() => setSearchFormActive(prev => !prev)}
                className="spin__settings-btn"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="122.88px"
                    height="80.593px"
                    viewBox="0 0 122.88 80.593"
                    xmlSpace="preserve"
                    className={`spin__settings-svg ${searchFormActive && 'spin__settings-svg--active'}`}
                >
                    <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                </svg>
                Search settings
                <svg
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    width="122.88px"
                    height="122.878px"
                    viewBox="0 0 122.88 122.878"
                    enableBackground="new 0 0 122.88 122.878"
                    xmlSpace="preserve"
                    className={`spin__settings-svg ${searchFormActive && 'spin__settings-svg--active'}`}
                >
                    <g>
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M101.589,14.7l8.818,8.819c2.321,2.321,2.321,6.118,0,8.439l-7.101,7.101 c1.959,3.658,3.454,7.601,4.405,11.752h9.199c3.283,0,5.969,2.686,5.969,5.968V69.25c0,3.283-2.686,5.969-5.969,5.969h-10.039 c-1.231,4.063-2.992,7.896-5.204,11.418l6.512,6.51c2.321,2.323,2.321,6.12,0,8.44l-8.818,8.819c-2.321,2.32-6.119,2.32-8.439,0 l-7.102-7.102c-3.657,1.96-7.601,3.456-11.753,4.406v9.199c0,3.282-2.685,5.968-5.968,5.968H53.629 c-3.283,0-5.969-2.686-5.969-5.968v-10.039c-4.063-1.232-7.896-2.993-11.417-5.205l-6.511,6.512c-2.323,2.321-6.12,2.321-8.441,0 l-8.818-8.818c-2.321-2.321-2.321-6.118,0-8.439l7.102-7.102c-1.96-3.657-3.456-7.6-4.405-11.751H5.968 C2.686,72.067,0,69.382,0,66.099V53.628c0-3.283,2.686-5.968,5.968-5.968h10.039c1.232-4.063,2.993-7.896,5.204-11.418l-6.511-6.51 c-2.321-2.322-2.321-6.12,0-8.44l8.819-8.819c2.321-2.321,6.118-2.321,8.439,0l7.101,7.101c3.658-1.96,7.601-3.456,11.753-4.406 V5.969C50.812,2.686,53.498,0,56.78,0h12.471c3.282,0,5.968,2.686,5.968,5.969v10.036c4.064,1.231,7.898,2.992,11.422,5.204 l6.507-6.509C95.471,12.379,99.268,12.379,101.589,14.7L101.589,14.7z M61.44,36.92c13.54,0,24.519,10.98,24.519,24.519 c0,13.538-10.979,24.519-24.519,24.519c-13.539,0-24.519-10.98-24.519-24.519C36.921,47.9,47.901,36.92,61.44,36.92L61.44,36.92z"
                        />
                    </g>
                </svg>
            </button>

            <div className="spin__search-params-wrapper" style={searchFormActive ? { zIndex: 1 } : {}}>
                <div className={`spin__search-params ${searchFormActive && 'spin__search-params--active'}`}>
                    <SearchParamsForm action={setData} />
                </div>
            </div>
            <div className={`spin__slider ${searchFormActive && 'spin__slider--hide'} `} >
                <SpinSlider
                    activeCardId={activeCardId}
                    like={like}
                    dislike={dislike}
                    blockUi={blockUi}
                    frontCard={frontCard}
                    setFrontCard={setFrontCard}
                    nextCard={nextCard}
                    children={[...usersData.map((item, id) => {
                        return <SpinCard
                            blockUi={blockUi}
                            userId={item.userId}
                            isLiked={likedCards.includes(item.userId)}
                            isDisliked={dislikedCards.includes(item.userId)}
                            like={like}
                            dislike={dislike}
                            key={id}
                            userData={item}
                            nextCard={nextCard}
                            prevCard={prevCard}
                            didDispyaed={id === frontCard}
                        />
                    }),
                    <LastSpinCard
                        key={usersData.length}
                        like={like}
                    />
                    ]} />
            </div>
        </main>
    );
}

export default Spin;

