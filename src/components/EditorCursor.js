import React, { useState, useContext } from "react"
import { find } from "lodash"
import EditorContext from "./contexts/EditorContext"
import "./editor-cursor.css"

const BACK_SPACE = "Backspace"
const ENTER = "Enter"

const appendCharacterTextNode = (editorId, content, ch) => {

}

const EditorCursor = (props) => {
    
    const { dispatch } = useContext(EditorContext)

    const [ keyValue, setKeyValue ] = useState("")
    const handleKeyEntry = (event) => {
        const key = event.key
        console.log(key)
        switch (key) {
            case BACK_SPACE:
                dispatch({ type: "back-space" })
                break
            case ENTER:
                dispatch({ type: "enter" })
                break
            default:
                break
        }
    }
    
    const handleChange = (event) => {
        dispatch({ type: "text-entry", payload: event.target.value })
        setKeyValue("")
    }


    return (
        <input 
            className="editor-cursor" 
            size="1" 
            maxLength="1" 
            onKeyUp={handleKeyEntry} 
            value={keyValue} 
            autoFocus
            onChange={handleChange}
        />
    )
}

export default EditorCursor