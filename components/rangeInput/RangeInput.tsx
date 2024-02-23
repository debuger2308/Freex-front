"use client"
import { CSSProperties, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import './RangeInput.css'

const RangeInput = ({ min, max, setValue, title, styles, value }:
    { value: number, min: number, max: number, setValue: Dispatch<SetStateAction<number>>, title: string, styles: CSSProperties }) => {

    const [maxVal, setMaxVal] = useState(max)
    const [inputValueMax, setInputValueMax] = useState<number>(max)

    useEffect(() => {
        setMaxVal(max)
        setInputValueMax(max)
    }, [max])


    const maxValueRef = useRef<HTMLInputElement>(null)
    const range = useRef<HTMLDivElement>(null)

    const getPercent = useCallback((value: number) => Math.round((value / max) * 100), [max])

    useEffect(() => {
        if (maxValueRef.current) {
            const percent = getPercent(value);
            if (range.current) {
                range.current.style.width = `${percent}%`;
            }
        }
        setInputValueMax(maxVal)
        setValue(maxVal)
    }, [maxVal, getPercent]);
    useEffect(() => {
        if (maxValueRef.current) {
            const percent = getPercent(value);
            if (range.current) {
                range.current.style.width = `${percent}%`;
            }
        }
    }, [value, getPercent]);


    return (
        <div className="rangeinput" style={styles}>
            <h3 className="rangeinput__title">{title}</h3>
            <div className="rangeinput__slider">
                <input
                    type="range"
                    max={max}
                    min={min}
                    value={value}
                    ref={maxValueRef}
                    onChange={(event) => {
                        const value = +event.currentTarget.value;
                        setMaxVal(value);
                        event.currentTarget.value = value.toString();
                    }}
                    className="rangeinput__thumb rangeinput__thumb--zindex-4"
                />
                <div className="rangeinput__slider">
                    <div className="rangeinput__track" />
                    <div ref={range} className="rangeinput__range" />

                </div>
            </div>
            <div className="rangeinput__inputs">
                <input
                    className="rangeinput__input"
                    type="text"
                    value={value}
                    onChange={(event) => {
                        if (!Number.isNaN(+event.currentTarget.value)) setInputValueMax(+event.currentTarget.value)
                    }}
                    onBlur={(event) => {
                        if (inputValueMax > max) {
                            setMaxVal(max)
                            setInputValueMax(max)
                        }
                        else {
                            setMaxVal(inputValueMax)
                        }
                    }}
                    onKeyUp={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur()
                        }
                    }}
                />
            </div>

        </div >
    );
}

export default RangeInput;