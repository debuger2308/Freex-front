"use client"

import Link from "next/link";
import "./LastSpinCard.css"

const LastSpinCard = ({ like }: {
    like: (id: number) => Promise<void>,
}) => {

    return (
        <div className="spin-card spin-card__last">
            <button
                onClick={() => like(-1)}
                className="spin-card__subtitle-wrapper">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="122.88px"
                    height="80.593px"
                    viewBox="0 0 122.88 80.593"
                    xmlSpace="preserve"
                    className='spin-card__arrow spin-card__arrow--top'
                >
                    <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                </svg>
                <p className="spin-card__subtitle">Load More</p>
            </button>
            <div className="spin-card__border"></div>
            <h1 className="spin-card__title">That`s all</h1>
            <div className="spin-card__border"></div>
            <Link href='/chats' className="spin-card__subtitle-wrapper">
                <p className="spin-card__subtitle">Go to chats</p>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="122.88px"
                    height="80.593px"
                    viewBox="0 0 122.88 80.593"
                    xmlSpace="preserve"
                    className='spin-card__arrow spin-card__arrow--bottom'
                >
                    <path d="M122.88 0L122.88 30.82 61.44 80.593 0 30.82 0 0 61.44 49.772 122.88 0z" />
                </svg>
            </Link>



        </div>
    );
}

export default LastSpinCard;