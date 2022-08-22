
export interface TextNode {
    value: string
    parent: Node
    id?: string
    attributes?: Attributes
}

export interface Attributes {
    [key: string]: string    
}

export interface Node {
    id: string
    tag: string
    attributes?: Attributes
    parent?: Node | {}
    children?: Array<Node | TextNode>
    value?: string
}

export interface DocumentNode {
    tag: string
    attributes?: Attributes
    children?: Array<DocumentNode>
}


