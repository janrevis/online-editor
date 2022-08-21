import defaultDocument from "./default-document"
import { v4 } from "uuid"

class DocumentModel {
    
    #model = {}
    #cursor

    constructor(doc = defaultDocument) {
        this.#model = this.insertDocumentNode(doc)
    }

    insertNodeAtIndex(parent, index, node) {
        const newNode = { ...node }
        if (node.tag && node.tag !== "EditorCursor" && !node.children) {
            newNode.children = []
        }
        newNode.parent = parent
        parent.children.splice(index, 0, newNode)
        return newNode
    }

    pushNode(parent, node) {
        return this.insertNodeAtIndex(parent, parent.children.length, node)
    }

    #getCursorIndex() {
        return this.#cursor.parent.children.findIndex(ch => ch === this.#cursor)
    }

    insertDocumentNode(node, parent) {
        
        const id = v4()
        if (typeof node === 'string') {
            if (!parent) {
                throw("doc-model-error: string element in doc required parent")
            }
            return { value: node, id: v4(), parent: parent }
        }
        const { attributes, tag } = node
        const modelNode = { id,  tag }
        if (tag !== "EditorCursor") {
            modelNode.attributes = { ...attributes, "doc-model-id": id }
        }
        if (!parent) {
            this.#model = modelNode
        } else {
            modelNode.parent = parent
        }
        if (node.children) {
            modelNode.children = []
            node.children.forEach(n => {
                modelNode.children.push(this.insertDocumentNode(n, modelNode))
            })
        }
        if (node.tag === "EditorCursor") {
            this.#cursor = modelNode
        }
        return modelNode
    }

    findPreviousTextNode(node, fromNode) {
        if (!node) {
            return null
        }
        if (node.value !== undefined) {
            return node
        }
        const parent = node.parent;
        if (node.children) {
            let l = node.children.findIndex(n => n === fromNode)
            if (l === -1) {
                l = node.children.length - 1
            } else {
                l = l - 1
            }
            for (let i = l; i >= 0; i--) {
                const subnode = this.findPreviousTextNode(node.children[i])
                if (subnode.value !== undefined) {
                    return subnode
                }     
            }
        }
        return this.findPreviousTextNode(node.parent, node)
    }

    enterTextCharacter(ch) {
        let textNode = this.findPreviousTextNode(this.#cursor)
        if (!textNode) {
            const parent = this.#cursor.parent
            const cursorIndex = parent.children.findIndex(
                ch => ch === this.#cursor
            )
            textNode = { value: [], id: v4(), parent }
            parent.children.splice(cursorIndex, 0, textNode)
        }
        textNode.value = textNode.value += ch
    }

    backspaceTextCharacter() {
        const textNode = this.findPreviousTextNode(this.#cursor);
        if (textNode.value.length > 0) {
            textNode.value = textNode.value.substring(0, textNode.value.length - 1)
        } else {
            textNode.parent.children = textNode.parent.children.filter(
                node => node !== textNode
            )
            const model = this.#model
            const cParent = this.#cursor.parent
            const newTextNode = this.findPreviousTextNode(this.#cursor)
            if (!newTextNode) {
                //we are at the start of the document, do nothing
                return
            }
            const newTextNodeIndex = newTextNode.parent.children.findIndex(n => n === newTextNode)
            newTextNode.value = newTextNode.value.substring(0, newTextNode.value.length - 1)
            this.insertNodeAtIndex(newTextNode.parent, newTextNodeIndex + 1, {
                tag: "EditorCursor",
            })
            if (cParent.children.length === 1) {
                const parentIndex = cParent.parent.children.findIndex(n => n === textNode.parent)
                cParent.parent.children.splice(parentIndex, 1) 
            } else {
                const cIndex = this.#getCursorIndex()
                cParent.children.splice(cIndex, 1)
            }
            this.#cursor = newTextNode.parent.children[newTextNodeIndex + 1]
        }
    }

    startParagraph() {
        const cIndex = this.#getCursorIndex()
        this.#cursor.parent.children.splice(cIndex, 1)
        const paragraph = this.pushNode(
            this.#model, 
            { tag: "p", attributes: {} }
        )
        this.pushNode(paragraph, { value: "" })
        this.#cursor = this.pushNode(paragraph, { tag: "EditorCursor" })
    }

    getCursor() {
        return this.#cursor
    }

    getModel() {
        return this.#model
    }

    dumpDoc() {
        const dump = {}
        this.cleanModel(this.#model, dump)
        return dump
    }

    cleanModel(node, dump) {
        if (node.tag) {
            dump.tag = node.tag
            dump.attributes = {...node.attributes}    
        }
        if (dump.attributes) {
            delete(dump.attributes["doc-model-id"])
        }
        if (node.children) {
            dump.children = []
            node.children.forEach((n, idx) => {
                if (n.value !== undefined) {
                    dump.children[idx] = n.value
                } else {
                    dump.children[idx] = { tag: n.tag, attributes: {...dump.attributes} }
                    this.cleanModel(n, dump.children[idx])
                }
            })
        }
    }

}

export default DocumentModel