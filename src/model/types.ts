
export interface EmptyNode {
    tag: "",
    id?: string,
    children: [],
    parent: { children: Array<EmptyNode> }
    attributes: {}
}

export interface Node {
    id: string
    tag: string
    attributes: object
    parent: Node | {}
    children: Array<Node>
    value?: string
}

export interface DocumentNode {
    tag: string
    attributes: object
    children: Array<DocumentNode>
    value?: string
}


