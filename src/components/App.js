import Editor from "./Editor"
import Preview from "./Preview"
import EditorProvider from "./EditorProvider"
import "./app.css"


const docContent = {
    tag: 'div',
    children: [
        {
            tag: 'p',
            attributes: {
                style: {
                    color: 'blue'
                },
            },
            children: [
                "I am the ",
                {
                    tag: 'span',
                    attributes: {
                        style: { fontWeight: 'bold' }
                    },
                    children: ['first']
                },
                " paragraph",
            ],
        },
        {
            tag: 'p',
            attributes: {
                style: {
                    color: 'green'
                }
            },
            children: [
                "I am",
                { tag: "EditorCursor"}
            ],
        },
    ]
}

const App = (props) => {
    return (
        <EditorProvider doc={docContent}>
            <h1>Editor Demo</h1>
            <div className="app-container">
                <div className="app-section">
                    <h1>Editor</h1>
                    <Editor className="app-section"></Editor>
                </div>
                <div className="app-section">
                    <h1>Preview</h1>
                    <Preview></Preview>
                </div>
            </div>
        </EditorProvider>
    )
}

export default App
