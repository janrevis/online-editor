import { useEffect, useReducer } from "react"
import defaultDocument from "../model/default-document"
import EditorContext from "./contexts/EditorContext"
import DocumentModel from "../model/DocumentModel"

let documentModel


const reducer = (state, action) => {
    console.log('action, ', action)
    switch(action.type) {
        case "load":
            const newState = { ...state, content: action.payload }
            return newState
        case "text-entry": {
            const ch = action.payload;
            documentModel.enterTextCharacter(ch)
            return { ...state, content: documentModel.getModel()}
        }
        case "back-space": {
            documentModel.backspaceTextCharacter()
            return { ...state, content: documentModel.getModel() }
        }
        case "enter": {
            documentModel.startParagraph()
            return { ...state, content: documentModel.getModel() }
        }
        default:
            return state
    }
}

export const EditorProvider =  ({ doc, children  }) => {
    const [ state, dispatch ] = useReducer(reducer, { })
    useEffect(() => {
        documentModel = new DocumentModel(doc || defaultDocument)
        dispatch({ type: "load", payload: documentModel.getModel() })
    }, [])
    return <EditorContext.Provider value={{
        state,
        dispatch,
    }}>
        <div>
            {children}
        </div>
    </EditorContext.Provider>
}

export default EditorProvider