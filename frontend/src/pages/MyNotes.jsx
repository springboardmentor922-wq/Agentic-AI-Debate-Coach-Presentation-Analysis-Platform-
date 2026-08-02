import { useState } from "react";
import AppShell from "../layouts/AppShell";

function MyNotes() {

    const [notes, setNotes] = useState([
        {
            id: 1,
            title: "Opening Statement",
            content:
                "Start with a strong hook, clearly state the position and briefly introduce the main arguments."
        },
        {
            id: 2,
            title: "Rebuttal Strategy",
            content:
                "Address the opponent's strongest claim directly instead of introducing unrelated arguments."
        }
    ]);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    function addNote() {

        if (!title.trim() || !content.trim()) {
            return;
        }

        const newNote = {
            id: Date.now(),
            title,
            content
        };

        setNotes([
            newNote,
            ...notes
        ]);

        setTitle("");
        setContent("");
    }

    function deleteNote(id) {

        setNotes(
            notes.filter(
                note => note.id !== id
            )
        );

    }

    return (
        <AppShell>

            <div className="page-header">

                <div>

                    <h1>📝 My Notes</h1>

                    <p>
                        Save debate ideas, arguments, rebuttals and
                        preparation notes.
                    </p>

                </div>

            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: "25px",
                    marginTop: "30px"
                }}
            >

                <div className="panel">

                    <h2>Create Note</h2>

                    <input
                        value={title}
                        placeholder="Note title"
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: "14px",
                            marginTop: "20px",
                            background: "#111827",
                            color: "white",
                            border: "1px solid #374151",
                            borderRadius: "10px",
                            boxSizing: "border-box"
                        }}
                    />

                    <textarea
                        value={content}
                        placeholder="Write your debate notes..."
                        onChange={(e) =>
                            setContent(e.target.value)
                        }
                        style={{
                            width: "100%",
                            minHeight: "180px",
                            padding: "14px",
                            marginTop: "15px",
                            background: "#111827",
                            color: "white",
                            border: "1px solid #374151",
                            borderRadius: "10px",
                            resize: "vertical",
                            boxSizing: "border-box"
                        }}
                    />

                    <button
                        onClick={addNote}
                        style={{
                            marginTop: "15px",
                            width: "100%"
                        }}
                    >
                        + Save Note
                    </button>

                </div>

                <div>

                    <h2
                        style={{
                            marginBottom: "20px"
                        }}
                    >
                        Saved Notes
                    </h2>

                    {notes.length === 0 && (

                        <div className="panel">

                            <p style={{ color: "#9ca3af" }}>
                                You haven't created any notes yet.
                            </p>

                        </div>

                    )}

                    {notes.map(note => (

                        <div
                            className="panel"
                            key={note.id}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "20px"
                                }}
                            >

                                <div>

                                    <h3>
                                        {note.title}
                                    </h3>

                                    <p
                                        style={{
                                            color: "#9ca3af",
                                            lineHeight: "1.7"
                                        }}
                                    >
                                        {note.content}
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        deleteNote(note.id)
                                    }
                                    style={{
                                        height: "42px"
                                    }}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </AppShell>
    );
}

export default MyNotes;