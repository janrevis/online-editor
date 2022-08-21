import React, { createContext, useState } from "react"
import defaultDocument from "../../model/default-document"

const EditorContext = createContext({ 
    content: defaultDocument,
    state: { content: defaultDocument}
})

export default EditorContext
