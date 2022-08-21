import React, { useContext } from "react"
import EditorContext from "./contexts/EditorContext"
import EditorCursor from "./EditorCursor"
import EditorContent from "./EditorContent"

const Editor = props => {

    const { state } = useContext(EditorContext)
    console.log('editor state, ', state)
    const handleContentClick = (event) => {
        console.log('event, ', event)
        // const range = document.caretRangeFromPoint(event.pageX, event.pageY)
        // console.log('range, ', range)
    }

    return (
        <EditorContent onClick={handleContentClick} content={state.content} />
    )
}

export default Editor