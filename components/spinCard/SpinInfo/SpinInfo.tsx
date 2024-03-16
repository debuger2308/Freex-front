import { useRef } from "react";
import "./SpinInfo.css"

const SpinInfo = ({ city, description, isDisplayInfo }: { city: string, description: string, isDisplayInfo: boolean }) => {


    const cityRef = useRef(null)
    const descRef = useRef(null)

    return (
        <div className={`spin__info ${isDisplayInfo && 'spin__info--active'}`} >

            <div className="scroll-wrapper" style={isDisplayInfo && { overflowY: 'scroll' } || {}}>
                <h3 className='spin__info-city' ref={cityRef} style={isDisplayInfo && { overflow: 'visible', whiteSpace: 'wrap' } || {}}>
                    {city},
                </h3>
                <p className='spin__info-desc' ref={descRef} style={isDisplayInfo && { overflow: 'visible', whiteSpace: 'wrap' } || {}}>
                    {description}
                </p>
            </div>

        </div>
    );
}

export default SpinInfo;