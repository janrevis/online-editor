
export interface Attributes {
    [key: string]: string    
}

export interface Node {
    id?: string
    tag: string
    attributes?: Attributes
    parent?: Node
    children?: Array<Node>
    value?: string
}

export interface DocumentNode {
    tag?: string
    attributes?: Attributes
    children?: Array<DocumentNode | string>
}


