import { useEffect, useRef } from "react"

const useOutsideAlerter = (ref, setPopup) => {
    useEffect(() => {
        const handleOutsideClick = (e) => {
            // if the reference does not contain the target of the click
            if (ref.current && !ref.current.contains(e.target)) {
                setPopup(false)
            }
        }

        document.addEventListener("mousedown", handleOutsideClick)

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [ref, setPopup]) 
}

export default useOutsideAlerter