"use client"
import { useEffect, useRef, useState } from "react";
import "./Chats.css"
import { getAuthInfo, requestWrapper } from "@/functions/api/api";
import { IAuthInfo } from "@/interfaces/IAuthInfo";
import { useSocket } from "@/providers/SocketProvider";



interface IMessages {
    createdAt: string,
    message: string | null,
    systemType: string | null,
    messageType: string,
    userId: number | null,
    status: string,
    id: number,
    chatId: string
}

interface IChats {
    id: number,
    chatId: string,
    chatType: string,
    messages: IMessages[],
    userData: IChatsUserData[],
    lastEventType?: string
}

export interface IChatsUserData {
    name: string | null,
    images: { fileName: string }[],
    userId: number
}



async function getChatsReq(authInfo: IAuthInfo) {

    const res = fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/get`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${authInfo.token}`
        }
    })
    return res
}
async function getChats(): Promise<IChats[]> {
    return await requestWrapper(getChatsReq, (data: IChats[]) => {

    }, () => { })
}

function excludeUserData(userData: IChatsUserData[], id: number) {

    return userData?.find((data) => data.userId !== id)
}

async function sendMessage(authInfo: IAuthInfo, data: { userId: number, message: string }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send-message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'authorization': `Bearer ${authInfo.token}`,
            'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return res
}
function addDayDataToMessages(messages: IMessages[]) {
    const newMessages: IMessages[] = []
    newMessages.push({
        chatId: '',
        id: -1,
        status: '',
        createdAt: '',
        messageType: 'system',
        systemType: 'date',
        userId: null,
        message: `${new Date(messages[0]?.createdAt).toLocaleString('default', { month: 'long' })} ${new Date(messages[0]?.createdAt).getDate()}`,
    })
    for (let i = 0; i < messages.length - 1; i++) {
        const messageDateA = new Date(messages[i].createdAt)
        const messageDateB = new Date(messages[i + 1].createdAt)
        newMessages.push(messages[i])
        if (messageDateB.getDate() - messageDateA.getDate() > 0
            || messageDateB.getMonth() - messageDateA.getMonth() > 0
            || messageDateB.getFullYear() - messageDateA.getFullYear() > 0
        ) {
            newMessages.push({
                chatId: '',
                id: -1,
                status: '',
                createdAt: '',
                messageType: 'system',
                systemType: 'date',
                userId: null,
                message: `${new Date(messages[i + 1]?.createdAt).toLocaleString('default', { month: 'long' })} ${new Date(messages[i + 1]?.createdAt).getDate()}`,
            })
        }
    }
    newMessages.push(messages[messages.length - 1])
    return newMessages
}


const Chats = () => {
    const socket = useSocket()

    const [chatsList, setChatsList] = useState<IChats[]>([])
    const [inputValue, setInputValue] = useState('')
    const [userData, setUserData] = useState<IAuthInfo | null>()
    const [isHideChat, setIsHideChat] = useState(true)
    const [chatsDisplayin, setChatsDisplaying] = useState('match')
    const [unreadMessagesList, setUnreadMessagesList] = useState<IMessages[]>([])
    const [activeChat, setActiveChat] = useState<IChats>(
        {
            chatId: '',
            chatType: '',
            id: -1,
            messages: [],
            userData: [],
        })
    const inputRef = useRef<HTMLInputElement>(null)
    const msgFieldRef = useRef<HTMLDivElement>(null)
    const lastMsgRef = useRef<HTMLDivElement>(null)
    const previousChatId = useRef<string | null>(null);

    function updateMessagesStatus(messages: IMessages[], eventType: string) {
        if (previousChatId.current === messages[0].chatId) {
            setActiveChat((prevActiveChat) => ({
                ...prevActiveChat,
                messages: prevActiveChat.messages.map((message) => {
                    const matchMessage = messages.find(msg => msg.id === message.id)
                    return matchMessage ? matchMessage : message
                }),
                lastEventType: eventType,
            }))
        }
        setChatsList((prevChats) =>
            prevChats.map((chat) => {
                if (chat.chatId === messages[0].chatId) {
                    return {
                        ...chat, messages: chat.messages.map((message) => {
                            const matchMessage = messages.find(msg => msg.id === message.id)
                            return matchMessage ? matchMessage : message
                        }), lastEventType: eventType
                    }
                }
                else return chat
            })
        )
    }

    useEffect(() => {
        (async () => {
            const [chats, userData] = await Promise.all([getChats(), getAuthInfo()])

            setUserData(userData)
            setChatsList(chats)
        })()

    }, [])

    useEffect(() => {
        function addMessageAndUpdateState(content: any, eventType: string) {
            if (previousChatId.current === content.chat.chatId) {
                setActiveChat((prevActiveChat) => ({
                    ...prevActiveChat,
                    messages: [...prevActiveChat.messages, content.message],
                    lastEventType: eventType,
                }))
            }
            setChatsList((prevChats) =>
                prevChats.map((chat) => {
                    if (chat.chatId === content.chat.chatId) {
                        return { ...chat, messages: [...chat.messages, content.message], lastEventType: eventType }
                    }
                    else return chat
                })
            )
        }


        if (userData) {
            socket?.emit('joinRoom', { room: 'room/' + userData?.userdata.id });
            socket?.on('sendMessage', (content) => {
                addMessageAndUpdateState(content, 'sendMessage')
            })
            socket?.on('receiveMessage', (content) => {
                addMessageAndUpdateState(content, 'receiveMessage')
            })
            socket?.on('updateMessagesStatus', (content) => {
                updateMessagesStatus(content, 'updateMessagesStatus')
            })
        }

    }, [userData]);

    useEffect(() => {

        const unreadMessages = activeChat.messages.filter((message) =>
            message.status === 'new'
            && message.userId !== userData?.userdata.id
            && message.messageType === 'user')
        setUnreadMessagesList([...unreadMessages])

        async function updateMessagesStatusReq(mesages: IMessages[]) {
            if (mesages.length > 0) {
                requestWrapper(async (authInfo) => {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/update-message-status`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: {
                            "authorization": `Bearer ${authInfo.token}`,
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify(mesages)
                    })
                    return res
                }, (messages: IMessages[]) => { updateMessagesStatus(messages, 'updateMessagesStatus'); }, () => { })
            }

        }

        function findVisibleMsgs(messages: IMessages[]) {
            return messages.filter((message) => {
                if (msgFieldRef) {
                    const messageElement = document.getElementById(`message-${message.createdAt}`);
                    if (!messageElement) return false;

                    const rect = messageElement.getBoundingClientRect();
                    const containerRect = msgFieldRef.current?.getBoundingClientRect();

                    return (
                        rect.top >= (containerRect?.top || 0) &&
                        rect.bottom <= (containerRect?.bottom || 0) &&
                        message.status === 'new'
                        && message.userId !== userData?.userdata.id
                        && message.messageType === 'user'
                    );
                }
            })
        }

        if (previousChatId.current === activeChat.chatId) {

            if (activeChat.lastEventType === 'sendMessage') {
                lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
            if (activeChat.lastEventType === 'receiveMessage') {

                const lastMessage = document.getElementById(`message-${activeChat.messages.at(-1)?.createdAt}`)
                const scrollPosBot = (msgFieldRef.current?.scrollHeight || 0) - (msgFieldRef.current?.scrollTop || 0) - (msgFieldRef.current?.clientHeight || 0) - (lastMessage?.scrollHeight || 0) - 12
                if (scrollPosBot <= 30) lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
        else {
            if (activeChat.lastEventType === 'changeActiveChat') {
                setInputValue('')
                if (unreadMessages.length > 0) {

                    const firstUnreadMessage = activeChat.messages.find(message =>
                        message.status === 'new'
                        && message.userId
                        && message.userId !== userData?.userdata.id
                        && message.messageType === 'user'
                    )

                    const unreadMessageElement = document.getElementById(`message-${firstUnreadMessage?.createdAt}`);

                    if (unreadMessageElement) unreadMessageElement.scrollIntoView({ behavior: 'instant', block: 'end' })
                    updateMessagesStatusReq(findVisibleMsgs(activeChat.messages))
                }

                else {
                    if (inputRef.current) {
                        inputRef.current.value = '';
                    }
                    lastMsgRef.current?.scrollIntoView({ behavior: 'auto' });
                }


            }

        }
        let visibleMessages: IMessages[] = []
        let scrollTimeout: any
        const handleScroll = () => {

            clearTimeout(scrollTimeout);
            findVisibleMsgs(activeChat.messages).map(message => {
                if (!visibleMessages.find(msg => msg.id === message.id)) visibleMessages.push(message)
            })

            scrollTimeout = setTimeout(function () {
                updateMessagesStatusReq(visibleMessages)
                visibleMessages = []
            }, 100);

        }
        msgFieldRef.current?.addEventListener('scroll', handleScroll)
        previousChatId.current = activeChat.chatId
        return () => {
            msgFieldRef.current?.removeEventListener('scroll', handleScroll);

        };
    }, [activeChat])


    console.log('render');

    return (
        <main className="chats">
            <div className="chats__container">
                <div className="chat">

                    <aside className="chat__aside">
                        <div className="chat__list-title">
                            <button
                                className={`chat__switch-chat ${chatsDisplayin === 'match' ? 'chat__switch-chat--active' : ''}`}
                                onClick={() => setChatsDisplaying('match')}
                            >
                                Matchs
                            </button>
                            <button
                                className={`chat__switch-chat ${chatsDisplayin === 'spam' ? 'chat__switch-chat--active' : ''}`}
                                onClick={() => setChatsDisplaying('spam')}
                            >
                                Spam
                            </button>
                        </div>
                        <div className="chat__list">
                            {
                                chatsList?.filter((chat) => {
                                    return chat.chatType === chatsDisplayin
                                }).map((chat) => {
                                    return <button
                                        key={chat.id}
                                        className={`chat__list-item ${chat.chatId === activeChat?.chatId && 'chat__list-item--active'}`}
                                        onClick={(() => {
                                            if (activeChat.chatId !== chat.chatId) setActiveChat({ ...chat, lastEventType: 'changeActiveChat' })
                                            setIsHideChat(false)

                                        })}
                                    >
                                        {excludeUserData(chat.userData, userData?.userdata?.id || -1)?.images.length !== 0
                                            ? <img
                                                src={process.env.NEXT_PUBLIC_API_URL + '/images/' + excludeUserData(chat.userData, userData?.userdata?.id || -1)?.images[0].fileName}
                                                className={`list-item__photo ${chat.chatId === activeChat?.chatId && 'list-item__photo--active'}`}>

                                            </img>
                                            : <div className={`list-item__photo ${chat.chatId === activeChat?.chatId && 'list-item__photo--active'}`}></div>
                                        }
                                        <h3 className="list-item__name">{excludeUserData(chat.userData, userData?.userdata?.id || -1)?.name}</h3>
                                        <p className="list-item__message">
                                            {chat.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).at(-1)?.messageType === 'system'
                                                ? chat.messages.at(-1)?.message?.replace(`&${userData?.userdata.id}&`, `You`).replace(`&${excludeUserData(chat.userData, userData?.userdata?.id || -1)?.userId}&`, `${excludeUserData(chat.userData, userData?.userdata?.id || -1)?.name}`)
                                                : chat.messages.at(-1)?.message
                                            }
                                        </p>
                                        {chat.messages.filter(message => message.status === 'new'
                                            && message.userId !== userData?.userdata.id
                                            && message.messageType === 'user').length > 0 &&
                                            <div className="list-item__unread-msg">
                                                {chat.messages.filter(message => message.status === 'new'
                                                    && message.userId !== userData?.userdata.id
                                                    && message.messageType === 'user').length}
                                            </div>
                                        }
                                    </button>
                                })

                            }
                        </div>
                    </aside>


                    <div
                        className={`chat__main ${isHideChat && 'chat__main--hide'}`}>
                        {activeChat.chatId !== ''
                            ?
                            <>
                                <div className="chat__main-title">
                                    <button
                                        disabled={isHideChat}
                                        onClick={(e) => {
                                            setIsHideChat(true)
                                            setActiveChat({
                                                chatId: '',
                                                chatType: '',
                                                id: -1,
                                                messages: [],
                                                userData: [],
                                                lastEventType: 'deleteActiveChat'
                                            })
                                        }}
                                        className={`chat__main-back-btn`}>
                                        <svg
                                            version="1.1"
                                            id="Layer_1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            x="0px"
                                            y="0px"
                                            viewBox="0 0 122.88 98.86"
                                            className='chat__main-back-svg'
                                            xmlSpace="preserve"
                                        >
                                            <style
                                                type="text/css"
                                                dangerouslySetInnerHTML={{
                                                    __html: ".st0{fill-rule:evenodd;clip-rule:evenodd;}"
                                                }}
                                            />
                                            <g>
                                                <path
                                                    className="st0"
                                                    d="M0,49.43l48.93,49.43V74.23c30.94-6.41,55.39,0.66,73.95,24.19c-3.22-48.4-36.29-71.76-73.95-73.31V0L0,49.43 L0,49.43L0,49.43z"
                                                />
                                            </g>
                                        </svg>
                                    </button>
                                    <h2 className="chat__main-name">{excludeUserData(activeChat?.userData, userData?.userdata?.id || -1)?.name}</h2>
                                    {excludeUserData(activeChat.userData, userData?.userdata?.id || -1)?.images?.length !== 0

                                        ? <img
                                            src={process.env.NEXT_PUBLIC_API_URL + '/images/' + excludeUserData(activeChat.userData, userData?.userdata?.id || -1)?.images[0].fileName}
                                            className='chat__main-photo'>

                                        </img>
                                        : <div className='chat__main-photo'></div>
                                    }
                                </div>


                                <div className="chat__main-field" ref={msgFieldRef}>
                                    {addDayDataToMessages(activeChat.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())).map((message, index) => {
                                        return <div
                                            key={message?.createdAt?.length === 0 ? index : message.createdAt}
                                            id={`message-${message?.createdAt?.length === 0 ? index : message.createdAt}`}
                                            className={
                                                `chat__message ${message?.userId === userData?.userdata.id && 'chat__message--right'} `
                                                + ` ${message?.userId !== userData?.userdata.id && message?.messageType === 'user' && 'chat__message--left'}`
                                                + ` ${message?.messageType === 'system' && 'chat__message--system'}`
                                                + ` ${message?.systemType === 'liked' && 'chat__message--like'}`
                                                + ` ${message?.systemType === 'disliked' && 'chat__message--dislike'}`
                                                + ` ${message?.systemType === 'date' && 'chat__message--date'}`
                                            }>
                                            {message?.messageType === 'system'
                                                ? message?.message?.replace(`&${userData?.userdata.id}&`, `You`).replace(`&${excludeUserData(activeChat.userData, userData?.userdata?.id || -1)?.userId}&`, `${excludeUserData(activeChat.userData, userData?.userdata?.id || -1)?.name}`)
                                                : message?.message
                                            }
                                            {
                                                <>

                                                    {message?.systemType !== 'date' &&
                                                        <span className="chat__message-time">

                                                            {new Date(message?.createdAt).getHours().toString().padStart(2, '0') + ':' + new Date(message?.createdAt).getMinutes().toString().padStart(2, '0')}
                                                        </span>
                                                    }

                                                    <span className="chat__message-status">

                                                        {message.userId === userData?.userdata.id &&
                                                            <svg
                                                                version="1.1"
                                                                id="Layer_1"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                                                x="0px"
                                                                y="0px"
                                                                width="122.877px"
                                                                height="101.052px"
                                                                viewBox="0 0 122.877 101.052"
                                                                enableBackground="new 0 0 122.877 101.052"
                                                                xmlSpace="preserve"
                                                            >
                                                                <g>
                                                                    <path d="M4.43,63.63c-2.869-2.755-4.352-6.42-4.427-10.11c-0.074-3.689,1.261-7.412,4.015-10.281 c2.752-2.867,6.417-4.351,10.106-4.425c3.691-0.076,7.412,1.255,10.283,4.012l24.787,23.851L98.543,3.989l1.768,1.349l-1.77-1.355 c0.141-0.183,0.301-0.339,0.479-0.466c2.936-2.543,6.621-3.691,10.223-3.495V0.018l0.176,0.016c3.623,0.24,7.162,1.85,9.775,4.766 c2.658,2.965,3.863,6.731,3.662,10.412h0.004l-0.016,0.176c-0.236,3.558-1.791,7.035-4.609,9.632l-59.224,72.09l0.004,0.004 c-0.111,0.141-0.236,0.262-0.372,0.368c-2.773,2.435-6.275,3.629-9.757,3.569c-3.511-0.061-7.015-1.396-9.741-4.016L4.43,63.63 L4.43,63.63z" />
                                                                </g>
                                                            </svg>
                                                        }
                                                        {message.userId === userData?.userdata.id && message.status === 'viewed' &&

                                                            <svg
                                                                version="1.1"
                                                                id="Layer_1"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                                                x="0px"
                                                                y="0px"
                                                                width="122.877px"
                                                                height="101.052px"
                                                                viewBox="0 0 122.877 101.052"
                                                                enableBackground="new 0 0 122.877 101.052"
                                                                xmlSpace="preserve"
                                                            >
                                                                <g>
                                                                    <path d="M4.43,63.63c-2.869-2.755-4.352-6.42-4.427-10.11c-0.074-3.689,1.261-7.412,4.015-10.281 c2.752-2.867,6.417-4.351,10.106-4.425c3.691-0.076,7.412,1.255,10.283,4.012l24.787,23.851L98.543,3.989l1.768,1.349l-1.77-1.355 c0.141-0.183,0.301-0.339,0.479-0.466c2.936-2.543,6.621-3.691,10.223-3.495V0.018l0.176,0.016c3.623,0.24,7.162,1.85,9.775,4.766 c2.658,2.965,3.863,6.731,3.662,10.412h0.004l-0.016,0.176c-0.236,3.558-1.791,7.035-4.609,9.632l-59.224,72.09l0.004,0.004 c-0.111,0.141-0.236,0.262-0.372,0.368c-2.773,2.435-6.275,3.629-9.757,3.569c-3.511-0.061-7.015-1.396-9.741-4.016L4.43,63.63 L4.43,63.63z" />
                                                                </g>
                                                            </svg>

                                                        }
                                                    </span>


                                                </>


                                            }
                                        </div>

                                    })}
                                    <div ref={lastMsgRef}></div>
                                </div>
                                {unreadMessagesList.length > 0 &&
                                    <button
                                        onClick={() => {
                                            lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="chat__main-scrollToBottomBtn">
                                        {unreadMessagesList.length}
                                        <svg
                                            version="1.1"
                                            id="Layer_1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            x="0px"
                                            y="0px"
                                            width="122.88px"
                                            height="80.593px"
                                            viewBox="0 0 122.88 80.593"
                                            enableBackground="new 0 0 122.88 80.593"
                                            xmlSpace="preserve"
                                        >
                                            <g>
                                                <polygon points="122.88,0 122.88,30.82 61.44,80.593 0,30.82 0,0 61.44,49.772 122.88,0" />
                                            </g>
                                        </svg>
                                    </button>
                                }

                                <div className="chat__main-input-box">
                                    <span
                                        className="main-input__placeholder"
                                        style={{
                                            opacity: inputValue.length === 0 ? 1 : 0
                                        }}

                                    >
                                        Write a message...
                                    </span>
                                    <div
                                        className="chat__main-input"
                                        contentEditable
                                        onInput={(e) => {
                                            setInputValue(e.currentTarget.innerText || '')
                                        }}
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                const formattedString = inputValue.replace(/^\s+/, '')
                                                if (formattedString.length > 0) {
                                                    await requestWrapper(
                                                        sendMessage,
                                                        () => {

                                                        },
                                                        () => {

                                                        },
                                                        { userId: excludeUserData(activeChat?.userData, userData?.userdata?.id || -1)?.userId, message: formattedString })
                                                }
                                                setInputValue('')
                                                inputRef?.current?.setHTMLUnsafe('')
                                                inputRef.current?.focus()
                                            }
                                        }}
                                        ref={inputRef}
                                    >

                                    </div>

                                    <button
                                        className="chat__send-btn"
                                        onClick={async (e) => {
                                            const formattedString = inputValue.replace(/^\s+/, '')
                                            if (formattedString.length > 0) {
                                                await requestWrapper(
                                                    sendMessage,
                                                    () => {

                                                    },
                                                    () => {

                                                    },
                                                    { userId: excludeUserData(activeChat?.userData, userData?.userdata?.id || -1)?.userId, message: formattedString })
                                            }
                                            setInputValue('')
                                            inputRef?.current?.setHTMLUnsafe('')
                                            inputRef.current?.focus()
                                        }}

                                    >
                                        <svg
                                            className="chat__send-svg"
                                            version="1.1"
                                            id="Layer_1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            x="0px"
                                            y="0px"
                                            viewBox="0 0 122.88 103.44"
                                            xmlSpace="preserve"
                                        >
                                            <g>
                                                <path d="M69.49,102.77L49.8,84.04l-20.23,18.27c-0.45,0.49-1.09,0.79-1.8,0.79c-1.35,0-2.44-1.09-2.44-2.44V60.77L0.76,37.41 c-0.98-0.93-1.01-2.47-0.09-3.45c0.31-0.33,0.7-0.55,1.11-0.67l0,0l118-33.2c1.3-0.36,2.64,0.39,3.01,1.69 c0.19,0.66,0.08,1.34-0.24,1.89l-49.2,98.42c-0.6,1.2-2.06,1.69-3.26,1.09C69.86,103.07,69.66,102.93,69.49,102.77L69.49,102.77 L69.49,102.77z M46.26,80.68L30.21,65.42v29.76L46.26,80.68L46.26,80.68z M28.15,56.73l76.32-47.26L7.22,36.83L28.15,56.73 L28.15,56.73z M114.43,9.03L31.79,60.19l38.67,36.78L114.43,9.03L114.43,9.03z" />
                                            </g>
                                        </svg>
                                    </button>
                                </div>
                            </>
                            :
                            <h1 className="chat__main-no-active-chat">Select a chat to start messaging</h1>

                        }

                    </div>
                </div>

            </div>
        </main>
    );
}

export default Chats;