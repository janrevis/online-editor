import React, { useContext, useRef, useLayoutEffect } from "react"
import { v4 } from "uuid"
import { set } from "lodash"
import EditorCursor from "./EditorCursor"
import EditorContext from "./contexts/EditorContext"

const EditorContent = ({ content, preview }) => {

    const { dispatch } = useContext(EditorContext)

    const docRef = useRef(null)
    const handleClick = (event) => {
        const cursor = docRef.current.querySelector(".editor-cursor")
        console.log('event, ', event)
        const range = document.caretRangeFromPoint(event.pageX, event.pageY)
        console.log('range, ', range)
        cursor.focus()
    }
    const parseContent = (content, parent) => {
        let childNodes
        if (content.value !== undefined) {
            return content.value
        }
        if (parent) {
            content.parent = parent
        }
        if (content.tag === "EditorCursor") {
            return !preview 
                ? <EditorCursor key="editorCursor" />
                : null
        }
        if (!content?.attributes?.editorId) {
            const id = v4()
            set(content, 'attributes.editorid', id)
            set(content, 'attributes.key', id)
        }
        if (content.children && Array.isArray(content.children)) {
            childNodes = content.children.map(ch => parseContent(ch, content))
        } else if (typeof content.children == 'string') {
            childNodes = content.children
        }
        return React.createElement(content.tag, content.attributes, childNodes)
    }
    if (!content) {
        return <div />
    }
    return <div ref={docRef} onClick={handleClick}>{parseContent(content)}</div>
}

export default EditorContent