import { useContext } from "react"
import DocumentModel from "./DocumentModel.ts"

describe("document nodel", () => {
    
    describe("model dump", () => {

        let docModel
        const baseDocument = {
            tag: "div",
            children: [
                {
                    tag: "p",
                    children: [
                        "abcd",
                        { tag: "s", children: [ "1234" ] },
                        { tag: "s", children: [ "5678" ] }
                    ]
                },
                {
                    tag: "p",
                    children: [ "asdf", { tag: "EditorCursor" } ]
                },
            ]
        }

        beforeEach(() => {
            docModel = new DocumentModel(baseDocument)
        })

        const checkNode = (node) => {
            expect(node.parent).not.toBeUndefined()
            expect(typeof node).not.toEqual("string")
            if (node.children) {
                node.children.forEach(n => checkNode(n))
            }
        }

        it("dumps the model without circular references, ", () => {
            const dump = docModel.dumpDoc()
            docModel.getModel().children.forEach(ch => checkNode(ch))
            expect(dump).toEqual({
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [
                            "abcd",
                            { tag: "s", children: [ "1234" ] },
                            { tag: "s", children: [ "5678" ] }
                        ]
                    },
                    {
                        tag: "p",
                        children: [ "asdf", { tag: "EditorCursor" } ]
                    },
                ]    
            })
        })
    
    }) 


    describe("document is empty", () => {
        let docModel
        const baseDocument = {
            tag: "div",
            children: [
                {
                    tag: "p",
                    children: [{ tag: "EditorCursor"}]
                }
            ]
        }

        beforeEach(() => {
            docModel = new DocumentModel(baseDocument)
        })

        it("does not find a previous text node", () => {
            const textNode = docModel.findPreviousTextNode(docModel.getCursor(), docModel.parent)
            expect(textNode).toBe(null)
        })

        it("inserts a character", () => {
            docModel.enterTextCharacter("a")
            expect(docModel.dumpDoc()).toEqual({
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [ 
                            "a", 
                            { 
                                tag: "EditorCursor",
                            } 
                        ]
                    },
                ]    
            })
        })
    })

    describe("text node directly before cursor", () => {

        let docModel
        const baseDocument = {
            tag: "div",
            children: [
                {
                    tag: "p",
                    children: [
                        "wrong node 1",
                        { tag: "s", children: [ "wrong node 2" ] },
                        { tag: "s", children: [ "wrong node 3" ] }
                    ]
                },
                {
                    tag: "p",
                    children: [ "correct text node found", { tag: "EditorCursor" } ]
                },
            ]
        }

        beforeEach(() => {
            docModel = new DocumentModel(baseDocument)
        })

        it("finds the directly previous text node", () => {
            const textNode = docModel.findPreviousTextNode(docModel.getCursor(), docModel.parent)
            expect(textNode.value).toEqual("correct text node found")
        })

        it("inserts a character", () => {
            docModel.enterTextCharacter("a")
            expect(docModel.dumpDoc()).toEqual({
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [
                            "wrong node 1",
                            { tag: "s", children: [ "wrong node 2" ] },
                            { tag: "s", children: [ "wrong node 3" ] }
                        ]
                    },
                    {
                        tag: "p",
                        children: [ 
                            "correct text node founda", 
                            { 
                                tag: "EditorCursor",
                            } 
                        ]
                    },
                ]    
            })
        })
    })

    describe("cursor behind empty text node, behind child node", () => {
        let docModel
        const baseDocument = {
            "tag": "div",
            "children": [
              {
                "tag": "p",
                "attributes": {
                  "style": {
                    "color": "blue"
                  },
                },
                "children": [
                  "I am the ",
                  {
                    "tag": "span",
                    "attributes": {
                      "style": {
                        "fontWeight": "bold"
                      },
                    },
                    "children": [
                      "first"
                    ]
                  },
                  "",
                  {
                    "tag": "EditorCursor",
                  }
                ]
              }
            ]        
        }

        beforeEach(() => {
            docModel = new DocumentModel(baseDocument)
        })

        it("deletes character when buffer is empty", () => {
            docModel.backspaceTextCharacter()
            expect(docModel.dumpDoc()).toEqual({
                "tag": "div",
                "children": [
                  {
                    "tag": "p",
                    "attributes": {
                      "style": {
                        "color": "blue"
                      },
                    },
                    "children": [
                      "I am the ",
                      {
                        "tag": "span",
                        "attributes": {
                          "style": {
                            "fontWeight": "bold"
                          },
                        },
                        "children": [
                          "firs",
                          {
                            "tag": "EditorCursor",
                          }    
                        ]
                      },
                    ]
                  }
                ]            
            })
        })


    })

    describe("cursor behind empty text node in front of paragraph", () => {
        let docModel
        const baseDocument = {
            tag: "div",
            children: [
                {
                    tag: "p",
                    children: [
                        "abcd",
                        { tag: "s", children: [ "1234" ] },
                        { tag: "s", children: [ "5678" ] }
                    ]
                },
                {
                    tag: "p",
                    children: [ "", { tag: "EditorCursor" } ]
                },
            ]
        }

        beforeEach(() => {
            docModel = new DocumentModel(baseDocument)
        })

        it("deletes character when buffer is empty", () => {
            docModel.backspaceTextCharacter()
            expect(docModel.dumpDoc()).toEqual({
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [
                            "abcd",
                            { tag: "s", children: [ "1234" ] },
                            { tag: "s", children: [ 
                                "567",
                                { 
                                    tag: "EditorCursor",
                                },
                            ] },
                        ]
                    },
                ]    
            })
        })

    })

    describe("cursor behind none-empty text node", () => {
        
        let docModel
        const baseDocument = {
            tag: "div",
            children: [
                {
                    tag: "p",
                    children: [
                        "abcd",
                        { tag: "s", children: [ "1234" ] },
                        { tag: "s", children: [ "5678" ] }
                    ]
                },
                {
                    tag: "p",
                    children: [ "asdf", { tag: "EditorCursor" } ]
                },
            ]
        }

        beforeEach(() => {
            docModel = new DocumentModel(baseDocument)
        })

        it("deletes character when buffer is not empty", () => {
            docModel.backspaceTextCharacter()
            expect(docModel.dumpDoc()).toEqual({
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [
                            "abcd",
                            { tag: "s", children: [ "1234" ] },
                            { tag: "s", children: [ "5678" ] }
                        ]
                    },
                    {
                        tag: "p",
                        children: [ 
                            "asd", 
                            { 
                                tag: "EditorCursor",
                            } 
                        ]
                    },
                ]    
            })
        })
    })

    describe("find previous text node in parent", () => {
        it("finds the previous text node in a sibling node", () => {
            const baseDocument = {
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [
                            "Text node 1",
                            { tag: "s", children: [ "text node 2" ] },
                            { tag: "s", children: [ "text node 3" ] }
                        ]
                    },
                    {
                        tag: "p",
                        children: [ 
                            "incorrect node 5", 
                            { tag: "span", children: ["correct text node found"]},
                            { tag: "EditorCursor" } 
                        ]
                    },
                ]
            }
            const docModel = new DocumentModel(baseDocument)
            const textNode = docModel.findPreviousTextNode(docModel.getCursor(), docModel.parent)
            expect(textNode.value).toEqual("correct text node found")
        })
    
        it("finds the last text node in the parent's sibling node", () => {
            const baseDocument = {
                tag: "div",
                children: [
                    {
                        tag: "p",
                        children: [
                            "Text node 1",
                            { tag: "s", children: [ "text node 2" ] },
                            { tag: "s", children: [ "text node 3" ] }
                        ]
                    },
                    {
                        tag: "p",
                        children: [ "correct text node found" ]
                    },
                    {
                        tag: "p",
                        children: [ { tag: "EditorCursor" } ]
                    },
                ]
            }
            const docModel = new DocumentModel(baseDocument)
            const textNode = docModel.findPreviousTextNode(docModel.getCursor(), docModel.parent)
            expect(textNode.value).toEqual("correct text node found")
        })
    
        it("finds the last text node in a parent sibling's child node", () => {
            const baseDocument = {
                tag: "div",
                children: [
                    {
                        tag: "p1",
                        children: [
                            "Text node 1",
                            { tag: "s1", children: ["text node 2"] },
                        ]
                    },
                    {
                        tag: "p2",
                        children: [
                            "text node 4",
                            {tag: 'span2', children: [ "correct text node found"]}
                        ]
                    },
                    {
                        tag: "p3",
                        children: [{ tag: "EditorCursor" }]
                    },
                ]
            }
            const docModel = new DocumentModel(baseDocument)
            const textNode = docModel.findPreviousTextNode(docModel.getCursor(), docModel.parent)
            expect(textNode.value).toEqual("correct text node found")
        })    
    })

})