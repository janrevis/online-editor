import defaultDocument from "./default-document"
import { v4 } from "uuid"
import { Node, DocumentNode, Attributes} from "./types"

class DocumentModel {
    
    #model: Node
    #cursor: Node | null = null

    constructor(doc: DocumentNode = defaultDocument) {
        this.#model = this.insertDocumentNode(doc)
    }

    insertNodeAtIndex(parent: Node, index: number, node: Node) {
        const newNode = { ...node, parent }
        if (node === null) {
            throw new ErrorEvent("insertNodeAtIndex: node cannot be null")
        }
        const n = node
        if (n.tag && n.tag !== "EditorCursor" && !n.children) {
            newNode.children = []
        }
        if (!parent.children) {
            throw new ErrorEvent("insertNodeAtIndex: parent's children must be an array of Nodes")
        }
        parent.children.splice(index, 0, newNode)
        return newNode
    }

    pushNode(parent: Node, node: Node) : Node | null {
        if (!node || !parent || !parent.children) {
            throw new Error("pushNode: the node and parent cannot be null")
        }
        return this.insertNodeAtIndex(parent, parent.children.length, node)
    }

    #getCursorIndex() : number {
        if (!this.#cursor || !this.#cursor.parent) {
            return -1
        }
        const parent = this.#cursor.parent
        if (!parent || !parent.children) {
            return -1
        }
        return parent.children.findIndex(ch => ch === this.#cursor)
    }

    insertDocumentNode(node: DocumentNode | string, parent: Node | null = null ): Node {
        
        const id = v4()
        if (typeof node === 'string') {
            const value: string = node 
            if (!parent) {
                throw("doc-model-error: string element in doc required parent")
            }
            return { tag: "text", value, id: v4(), parent: parent }
        }
        const { attributes, tag } = node
        if (!tag) {
            throw new Error("insertDocumentNode: ndoe tag must be defined")
        }
        const modelNode: Node = { id,  tag, attributes: {} }
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
                (modelNode.children as Array<Node>).push(this.insertDocumentNode(n, modelNode))
            })
        }
        if (node.tag === "EditorCursor") {
            this.#cursor = modelNode
        }
        return modelNode
    }

    findPreviousTextNode(node: Node, fromNode: Node | null = null) : Node | null  {
        if (!node) {
            return null
        }
        if (node.value || node.value === "") {
            return node
        }
        if (node.children) {
            let l = node.children.findIndex(n => n === fromNode)
            if (l === -1) {
                l = node.children.length - 1
            } else {
                l = l - 1
            }
            for (let i = l; i >= 0; i--) {
                const subnode = this.findPreviousTextNode(node.children[i])
                if (!subnode) {
                    return null
                }
                if (subnode.tag == "text") {
                    return subnode
                }     
            }
        }
        if (!node.parent) {
            return null
        }
        return this.findPreviousTextNode(node.parent, node)
    }

    enterTextCharacter(ch: string) {
        if (!this.#cursor) {
            throw new Error("enterTextCharacter: cursor is undefined")
        }
        if (!this.#cursor.parent) {
            throw new Error("enterTextCharacter: cursor cannot be a top level node")
        }
        let textNode = this.findPreviousTextNode(this.#cursor)
        if (!textNode) {
            const parent = this.#cursor.parent 
            const children = parent.children
            if (children) {
                const cursorIndex = children.findIndex(
                    (ch: Node) => ch === this.#cursor
                ) as number
                children.splice(cursorIndex, 0, { tag: "text", value: ch, id: v4(), parent })    
            }
        } else {
            textNode.value = textNode.value + ch
        }
    }

    backspaceTextCharacter() {
        if (!this.#cursor) {
            return 
        }
        const textNode = this.findPreviousTextNode(this.#cursor);
        if (!textNode || textNode.value === undefined) {
            // we are at the start of the document, do nothing on backspace
            return
        }
        if (textNode.value.length > 0) {
            textNode.value = textNode.value.substring(0, textNode.value.length - 1)
        } else {
            if (!textNode.parent) {
                throw new Error("backspaceTextCharacter: text node is missing parent node")
            }
            textNode.parent.children = (textNode.parent.children as Array<Node>).filter(
                (node: Node): boolean => node !== textNode
            )
            const model = this.#model
            const cParent = this.#cursor.parent
            if (!cParent) {
                throw new Error("backspaceTextCharacter: cursor must have a parent")
            }
            const newTextNode = this.findPreviousTextNode(this.#cursor)
            if (!newTextNode) {
                //we are at the start of the document, do nothing
                return
            }
            const parent = newTextNode.parent
            if (!parent) {
                throw new Error("backspaceTextCharacter: text node must have a parent")
            }
            const newTextNodeIndex: number = (parent.children as Array<Node>)
                .findIndex((n: Node): boolean => n === newTextNode)
            if (!newTextNode.value) {
                throw new Error("backspaceTextCharacter: value is not defined")
            }
            newTextNode.value = newTextNode.value.substring(0, newTextNode.value.length - 1)
            const oldCursor = this.#cursor
            this.moveCursorTo(parent, newTextNodeIndex)
            this.removeEmptyNode(oldCursor)
        }
    }

    removeEmptyNode(node: Node) {
        if (!node?.parent?.children) {
            return
        }
        if (node?.parent?.children?.length === 0) {
            const superParent = node.parent.parent;
            if (superParent && superParent.children) {
                const index = superParent.children.findIndex(ch => ch === node.parent)
                superParent.children.splice(index, 1)
            }            
        }
    }

    moveCursorTo(node: Node, index: number = -1) {
        if (!node || !node.children || !this.#cursor?.parent?.children) {
            throw new Error("moveCursorTo: node must be a valid node with children")
        }
        const cursorChildren = this.#cursor.parent.children
        const newEditor: { tag: string, attributes?: Attributes} = { tag: "EditorCursor" }
        if (this.#cursor.attributes) {
            newEditor.attributes = this.#cursor.attributes
        }
        if (index === -1) {
            node.children.push(newEditor)
        } else {
            node.children.splice(index+1, 0, newEditor)
        }
        cursorChildren.splice(this.#getCursorIndex(), 1)
        this.#cursor = newEditor
    }

    startParagraph() {
        const cIndex = this.#getCursorIndex()
        const cursor = this.#cursor
        const parent = cursor as Node
        
        if (!this.#model) {
            return
        }

        const paragraph = this.pushNode(
            this.#model as Node, 
            { tag: "p", attributes: {}, id: v4() }
        )
        if (!paragraph) {
            throw new Error("startParagraph: new paragraph could not be created")
        }
        this.pushNode(paragraph, { tag: "text", value: "", parent: paragraph})
        this.moveCursorTo(paragraph)

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

    cleanModel(node: Node, dump: DocumentNode) {
        if (node.tag) {
            dump.tag = node.tag
        }
        if (node && node.attributes) {
            const newAttr: Attributes  = {}
            let attrCount = 0
            Object.keys(node.attributes).forEach((key: string) => {
                if (key !== "doc-model-id" && node.attributes && node.attributes[key]) {
                    newAttr[key] = node.attributes[key]
                    attrCount++
                }
            })
            if (attrCount) {
                dump.attributes = newAttr
            }
        }
        if (node.children) {
            dump.children = []
            node.children.forEach((n, idx) => {
                if (!dump.children) {
                    return
                }
                if (n.value !== undefined) {
                    dump.children[idx] = n.value
                } else {
                    dump.children[idx] = { 
                        tag: n.tag, 
                    }
                    this.cleanModel(n, (dump.children as Array<DocumentNode>)[idx])
                }
            })
        }
    }

}

export default DocumentModel