import React, { useContext } from "react"
import EditorContext from "./contexts/EditorContext"
import EditorContent from "./EditorContent"


const Preview =  (props) => {
    const { state } = useContext(EditorContext)
    return (
        <div><EditorContent content={state.content} preview={true} /></div>
    )
}

export default Preview