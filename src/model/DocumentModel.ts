import defaultDocument from "./default-document"
import { v4 } from "uuid"
import { Node, DocumentNode, TextNode , Attributes} from "./types"

class DocumentModel {
    
    #model: Node | TextNode
    #cursor: Node | null = null

    constructor(doc: DocumentNode = defaultDocument) {
        this.#model = this.insertDocumentNode(doc)
    }

    insertNodeAtIndex(parent: Node, index: number, node: Node | TextNode) {
        const newNode = { ...node, parent }
        const n = node as Node
        if (n.tag && n.tag !== "EditorCursor" && !n.children) {
            (newNode as Node).children = []
        }
        (parent.children as Array<Node>).splice(index, 0, newNode as Node)
        return newNode
    }

    pushNode(parent: Node, node: Node | TextNode) : Node | TextNode | null {
        if (!node) {
            return null;
        }
        return this.insertNodeAtIndex(parent, (parent.children as Array<Node>).length, node)
    }

    #getCursorIndex() : number {
        if (!this.#cursor || !this.#cursor.parent || !this.#cursor.children) {
            return -1
        }
        const cursor = this.#cursor as Node
        const parent = cursor.parent as Node
        return (parent.children as Array<Node>).findIndex(ch => ch === this.#cursor)
    }

    insertDocumentNode(node: DocumentNode | string, parent: Node | null = null ): Node | TextNode {
        
        const id = v4()
        if (typeof node === 'string') {
            const value: string = node 
            if (!parent) {
                throw("doc-model-error: string element in doc required parent")
            }
            return { value, id: v4(), parent: parent }
        }
        const { attributes, tag } = node
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
                (modelNode.children as Array<Node>).push(this.insertDocumentNode(n, modelNode) as Node)
            })
        }
        if (node.tag === "EditorCursor") {
            this.#cursor = modelNode
        }
        return modelNode
    }

    findPreviousTextNode(node: Node | TextNode, fromNode: Node | null = null) : TextNode | Node | null  {
        if (!node) {
            return null
        }
        if (node.value || node.value === "") {
            return node
        }
        const children = (node as Node).children
        if (children) {
            const n = node as Node
            let l = (n.children as Array<Node>).findIndex(n => n === fromNode)
            if (l === -1) {
                l = (n.children as Array<Node>).length - 1
            } else {
                l = l - 1
            }
            for (let i = l; i >= 0; i--) {
                const subnode = this.findPreviousTextNode((n.children as Array<Node>)[i])
                if ((subnode as TextNode).value !== undefined) {
                    return subnode
                }     
            }
        }
        const n = node as Node
        return this.findPreviousTextNode((n.parent as Node), node as Node)
    }

    enterTextCharacter(ch: string) {
        if (!this.#cursor) {
            throw new Error("enterTextCharacter: cursor is undefined")
        }
        let textNode = this.findPreviousTextNode(this.#cursor as Node)
        if (!textNode) {
            const cursor = this.#cursor as Node
            const parent = cursor.parent as Node
            const children = parent.children as Array<Node>
            const cursorIndex = children.findIndex(
                (ch: Node) => ch === this.#cursor
            ) as number
            (parent.children as Array<Node | TextNode>)
                .splice(cursorIndex, 0, { value: ch, id: v4(), parent })
        } else {
            textNode.value = textNode.value + ch
        }
    }

    backspaceTextCharacter() {
        if (!this.#cursor) {
            return 
        }
        const textNode = this.findPreviousTextNode(this.#cursor) as TextNode;
        if (!textNode) {
            // we are at the start of the document, do nothing on backspace
            return
        }
        if (textNode.value.length > 0) {
            textNode.value = textNode.value.substring(0, textNode.value.length - 1)
        } else {
            textNode.parent.children = (textNode.parent.children as Array<Node>).filter(
                (node: Node | TextNode): boolean => node !== textNode
            )
            const model = this.#model
            const cParent = this.#cursor.parent as Node
            const newTextNode = this.findPreviousTextNode(this.#cursor) as TextNode
            if (!newTextNode) {
                //we are at the start of the document, do nothing
                return
            }
            const parent = newTextNode.parent as Node
            const newTextNodeIndex: number = (parent.children as Array<Node | TextNode>)
                .findIndex((n: Node | TextNode): boolean => n === newTextNode)
            if (!newTextNode.value) {
                throw new Error("backspaceTextCharacter: value is not defined")
            }
            newTextNode.value = newTextNode.value.substring(0, newTextNode.value.length - 1)
            this.insertNodeAtIndex(
                newTextNode.parent, newTextNodeIndex + 1, 
                { tag: "EditorCursor", id: v4(), parent }
            )
            const cChildren = cParent.children as Array<Node | TextNode>
            const pChildren = parent.children as Array<Node | TextNode>
            if (cChildren.length === 1) {
                // after deleting the old cursor the node will be empty so remove the 
                // whole node
                const superParent = cParent.parent as Node
                const superChildren = superParent.children as Array<Node | TextNode>
                const parentIndex = superChildren.findIndex(n => n === textNode.parent)
                superChildren.splice(parentIndex, 1) 
            } else {
                const cIndex = this.#getCursorIndex()
                cChildren.splice(cIndex, 1)
            }
            this.#cursor = pChildren[newTextNodeIndex + 1] as Node
        }
    }

    startParagraph() {
        const cIndex = this.#getCursorIndex()
        const cursor = this.#cursor as Node
        const parent = cursor as Node
        (parent.children as Array<Node | TextNode>).splice(cIndex, 1)
        const paragraph = this.pushNode(
            this.#model as Node, 
            { tag: "p", attributes: {}, id: v4() }
        )
        if (!paragraph) {
            throw new Error("startParagraph: new p node is not defined")
        }
        this.pushNode(paragraph as Node, { value: "", parent: paragraph as Node})
        this.#cursor = this.pushNode(
            paragraph as Node, 
            { tag: "EditorCursor", parent } as Node
        ) as Node
    }

    getCursor() {
        return this.#cursor
    }

    getModel() {
        return this.#model
    }

    dumpDoc() {
        const dump = {}
        this.cleanModel(this.#model as Node, dump as DocumentNode)
        return dump
    }

    cleanModel(node: Node, dump: DocumentNode) {
        if (node.tag) {
            dump.tag = node.tag
        }
        if (node.attributes) {
            const newAttr: Attributes  = {}
            let attrCount = 0
            Object.keys((node.attributes as {})).forEach((key: string) => {
                if (key !== "doc-model-id") {
                    newAttr[key] = (node.attributes as Attributes)[key]
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
                if (n.value !== undefined) {
                    (dump.children as Array<DocumentNode | string>)[idx] = n.value
                } else {
                    (dump.children as Array<DocumentNode | string>)[idx] = { 
                        tag: (n as Node).tag, 
                    }
                    this.cleanModel(n as Node, (dump.children as Array<DocumentNode>)[idx])
                }
            })
        }
    }

}

export default DocumentModel