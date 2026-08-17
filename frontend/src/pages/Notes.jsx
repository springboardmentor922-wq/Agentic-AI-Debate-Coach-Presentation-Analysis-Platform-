import { useEffect, useState } from "react";

import Layout from "../components/Layout";

import {
    getMyNotes,
    createNote,
    deleteNote,
} from "../services/noteService";


function Notes() {

    const [notes, setNotes] = useState([]);

    const [title, setTitle] = useState("");

    const [content, setContent] = useState("");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);


    useEffect(() => {

        loadNotes();

    }, []);


    async function loadNotes() {

        try {

            const data = await getMyNotes();

            setNotes(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load notes:",
                error
            );

        } finally {

            setLoading(false);

        }

    }


    async function handleSave() {

        if (!title.trim()) {

            alert(
                "Please enter a note title."
            );

            return;

        }


        if (!content.trim()) {

            alert(
                "Please enter note content."
            );

            return;

        }


        try {

            setSaving(true);


            const newNote =
                await createNote({

                    title,

                    content,

                });


            setNotes(
                (previous) => [
                    newNote,
                    ...previous
                ]
            );


            setTitle("");

            setContent("");


        } catch (error) {

            console.error(error);

            alert(
                "Failed to save note."
            );

        } finally {

            setSaving(false);

        }

    }


    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this note?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteNote(id);


            setNotes(
                (previous) =>
                    previous.filter(
                        (note) =>
                            note.id !== id
                    )
            );


        } catch (error) {

            console.error(error);

            alert(
                "Failed to delete note."
            );

        }

    }


    return (

        <Layout>

            <div className="dashboard-page">


                {/* HEADER */}

                <div className="hero-card">

                    <div>

                        <h2>
                            My Notes
                        </h2>

                        <p>
                            Save important ideas, arguments and learning points.
                        </p>

                    </div>

                </div>


                {/* CREATE NOTE */}

                <div className="chart-card">

                    <h3>
                        Create a Note
                    </h3>


                    <input
                        className="form-control"
                        placeholder="Note title"
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
                            )
                        }
                    />


                    <textarea
                        className="form-control"
                        rows="7"
                        placeholder="Write your note..."
                        value={content}
                        onChange={(e) =>
                            setContent(
                                e.target.value
                            )
                        }
                        style={{
                            marginTop: "15px",
                        }}
                    />


                    <button
                        className="btn btn-primary"
                        style={{
                            marginTop: "15px",
                        }}
                        onClick={handleSave}
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Note"}

                    </button>

                </div>


                {/* NOTES */}

                <div
                    className="chart-card"
                    style={{
                        marginTop: "25px",
                    }}
                >

                    <h3>
                        Saved Notes
                    </h3>


                    {loading ? (

                        <p>
                            Loading notes...
                        </p>

                    ) : notes.length === 0 ? (

                        <p>
                            No notes yet. Create your first note above.
                        </p>

                    ) : (

                        notes.map((note) => (

                            <div
                                key={note.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    padding: "18px",
                                    marginTop: "15px",
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "15px",
                                    }}
                                >

                                    <h4>
                                        {note.title}
                                    </h4>


                                    <button
                                        className="btn btn-danger"
                                        onClick={() =>
                                            handleDelete(
                                                note.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>


                                <p
                                    style={{
                                        marginTop: "10px",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {note.content}
                                </p>


                                <small>
                                    {note.created_at
                                        ? new Date(
                                            note.created_at
                                        ).toLocaleString()
                                        : ""}
                                </small>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </Layout>

    );

}


export default Notes;