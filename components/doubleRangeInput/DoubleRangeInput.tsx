"use client"

import { CSSProperties, Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import "./DoubleRangeInput.css"


const DoubleRangeInput = (
    { min,
        max,
        setActualMinValue,
        setActualMaxValue,
        title,
        styles,
        minValue,
        maxValue
    }
        :
        {
            minValue: number,
            maxValue: number,
            min: number,
            max: number,
            setActualMinValue: Dispatch<SetStateAction<number>>,
            setActualMaxValue: Dispatch<SetStateAction<number>>,
            title: string,
            styles: CSSProperties
        }
) => {

    const [minVal, setMinVal] = useState(min)
    const [maxVal, setMaxVal] = useState(max)


    const [inputValueMin, setInputValueMin] = useState<number>(min)
    const [inputValueMax, setInputValueMax] = useState<number>(max)

    useEffect(() => {
        setMinVal(min)
        setMaxVal(max)
    }, [min, max])

    const minValueRef = useRef<HTMLInputElement>(null)
    const maxValueRef = useRef<HTMLInputElement>(null)
    const range = useRef<HTMLDivElement>(null)

    const getPercent = useCallback((value: number) => Math.round(((value - min) / (max - min)) * 100), [min, max])


    useEffect(() => {
        setMinVal(minValue)
    }, [minValue])
    useEffect(() => {
        setMaxVal(maxValue)
    }, [maxValue])
    useEffect(() => {
        if (maxValueRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(+maxValueRef.current.value);

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, getPercent]);
    useEffect(() => {
        if (minValueRef.current) {
            const minPercent = getPercent(+minValueRef.current.value);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [maxVal, getPercent]);


    return (
        <div className="rangeinput" style={styles}>
            <h3 className="rangeinput__title">{title}</h3>
            <div className="rangeinput__slider">

                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    ref={minValueRef}
                    onChange={(event) => {
                        const value = Math.min(+event.currentTarget.value, maxVal - 1)
                        setActualMinValue(value)
                        event.currentTarget.value = value.toString()
                    }}
                    className={minValue === max - 1 ? "rangeinput__thumb rangeinput__thumb--zindex-5" : "rangeinput__thumb rangeinput__thumb--zindex-3"}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    ref={maxValueRef}
                    onChange={(event) => {
                        const value = Math.max(+event.currentTarget.value, minVal + 1)
                        setActualMaxValue(value)
                        event.currentTarget.value = value.toString()
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
                    type="number"
                    value={minVal}
                    onChange={(event) => {
                        const value = +event.currentTarget.value
                        if (!Number.isNaN(value)) {
                            if (value >= min && value < maxVal) setActualMinValue(value)
                        }
                    }}
                />

                <input
                    className="rangeinput__input"
                    type="number"
                    value={maxVal}
                    onChange={(event) => {
                        const value = +event.currentTarget.value
                        if (!Number.isNaN(value)) {
                            if (value <= max && value > minVal) setActualMaxValue(value)
                        }
                    }}
                />
            </div>

        </div >
    );
}

export default DoubleRangeInput;