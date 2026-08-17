import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import {
    createAnnouncement,
    getEducatorAnnouncements,
    deleteAnnouncement
} from "../services/announcementService";

import {
    getEducatorClasses
} from "../services/educatorClassService";


function EducatorAnnouncements() {

    const [announcements, setAnnouncements] =
        useState([]);

    const [classes, setClasses] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    const [title, setTitle] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [classroomId, setClassroomId] =
        useState("");

    const [priority, setPriority] =
        useState("Normal");


    useEffect(() => {

        loadData();

    }, []);


    const loadData = async () => {

        try {

            setLoading(true);

            const [
                announcementData,
                classData
            ] = await Promise.all([

                getEducatorAnnouncements(),

                getEducatorClasses()

            ]);


            setAnnouncements(
                announcementData || []
            );

            setClasses(
                classData || []
            );

        } catch (error) {

            console.error(
                "Failed to load announcements:",
                error
            );

        } finally {

            setLoading(false);

        }

    };


    const handleCreate = async () => {

        if (!title.trim()) {

            alert(
                "Please enter an announcement title."
            );

            return;

        }


        if (!message.trim()) {

            alert(
                "Please enter the announcement message."
            );

            return;

        }


        try {

            setSaving(true);


            await createAnnouncement({

                title: title.trim(),

                message: message.trim(),

                classroom_id:
                    classroomId
                        ? Number(classroomId)
                        : null,

                priority

            });


            alert(
                "Announcement posted successfully!"
            );


            setTitle("");

            setMessage("");

            setClassroomId("");

            setPriority("Normal");


            await loadData();

        } catch (error) {

            console.error(error);

            alert(

                error?.response?.data?.detail ||

                "Unable to create announcement."

            );

        } finally {

            setSaving(false);

        }

    };


    const handleDelete = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Delete this announcement?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteAnnouncement(id);

            await loadData();

        } catch (error) {

            alert(

                error?.response?.data?.detail ||

                "Unable to delete announcement."

            );

        }

    };


    if (loading) {

        return (

            <Layout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading announcements...
                    </h2>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "30px"
                }}
            >

                <h1>
                    Announcements
                </h1>

                <p
                    style={{
                        color: "#64748b"
                    }}
                >
                    Share important updates,
                    instructions and topics with
                    your learners.
                </p>


                {/* ==================================================
                    CREATE ANNOUNCEMENT
                ================================================== */}

                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "16px",
                        marginTop: "25px",
                        border: "1px solid #e2e8f0"
                    }}
                >

                    <h2>
                        Create Announcement
                    </h2>


                    <input
                        type="text"
                        placeholder="Announcement title"
                        value={title}
                        onChange={
                            e =>
                                setTitle(
                                    e.target.value
                                )
                        }
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginBottom: "15px",
                            boxSizing: "border-box",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "9px"
                        }}
                    />


                    <textarea
                        rows="6"
                        placeholder="Write your announcement..."
                        value={message}
                        onChange={
                            e =>
                                setMessage(
                                    e.target.value
                                )
                        }
                        style={{
                            width: "100%",
                            padding: "13px",
                            marginBottom: "15px",
                            boxSizing: "border-box",
                            border:
                                "1px solid #cbd5e1",
                            borderRadius: "9px"
                        }}
                    />


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "15px"
                        }}
                    >

                        <select
                            value={classroomId}
                            onChange={
                                e =>
                                    setClassroomId(
                                        e.target.value
                                    )
                            }
                            style={{
                                padding: "13px",
                                border:
                                    "1px solid #cbd5e1",
                                borderRadius: "9px"
                            }}
                        >

                            <option value="">
                                All Learners
                            </option>

                            {classes.map(
                                classroom => (

                                    <option
                                        key={
                                            classroom.id
                                        }
                                        value={
                                            classroom.id
                                        }
                                    >
                                        {classroom.name}
                                    </option>

                                )
                            )}

                        </select>


                        <select
                            value={priority}
                            onChange={
                                e =>
                                    setPriority(
                                        e.target.value
                                    )
                            }
                            style={{
                                padding: "13px",
                                border:
                                    "1px solid #cbd5e1",
                                borderRadius: "9px"
                            }}
                        >

                            <option value="Normal">
                                Normal
                            </option>

                            <option value="Important">
                                Important
                            </option>

                            <option value="Urgent">
                                Urgent
                            </option>

                        </select>

                    </div>


                    <button
                        onClick={
                            handleCreate
                        }
                        disabled={saving}
                        style={{
                            marginTop: "18px",
                            background:
                                "#5b21b6",
                            color: "white",
                            border: "none",
                            padding:
                                "12px 22px",
                            borderRadius: "9px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >

                        {saving
                            ? "Posting..."
                            : "Post Announcement"}

                    </button>

                </div>


                {/* ==================================================
                    EXISTING ANNOUNCEMENTS
                ================================================== */}

                <div
                    style={{
                        marginTop: "30px"
                    }}
                >

                    <h2>
                        Your Announcements
                    </h2>


                    {announcements.length === 0 ? (

                        <div
                            style={{
                                background: "white",
                                padding: "40px",
                                borderRadius: "15px",
                                textAlign: "center"
                            }}
                        >

                            <h3>
                                No announcements yet
                            </h3>

                            <p>
                                Create your first
                                announcement above.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                display: "grid",
                                gap: "15px"
                            }}
                        >

                            {announcements.map(
                                announcement => (

                                    <div
                                        key={
                                            announcement.id
                                        }
                                        style={{
                                            background:
                                                "white",
                                            padding:
                                                "20px",
                                            borderRadius:
                                                "15px",
                                            border:
                                                "1px solid #e2e8f0"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                gap:
                                                    "15px"
                                            }}
                                        >

                                            <div>

                                                <h3>
                                                    {
                                                        announcement.title
                                                    }
                                                </h3>

                                                <p
                                                    style={{
                                                        whiteSpace:
                                                            "pre-wrap"
                                                    }}
                                                >
                                                    {
                                                        announcement.message
                                                    }
                                                </p>

                                                <small
                                                    style={{
                                                        color:
                                                            "#64748b"
                                                    }}
                                                >
                                                    Priority:{" "}
                                                    {
                                                        announcement.priority
                                                    }
                                                </small>

                                            </div>


                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        announcement.id
                                                    )
                                                }
                                                style={{
                                                    height:
                                                        "40px",
                                                    background:
                                                        "#fee2e2",
                                                    color:
                                                        "#b91c1c",
                                                    border:
                                                        "none",
                                                    padding:
                                                        "0 14px",
                                                    borderRadius:
                                                        "8px",
                                                    cursor:
                                                        "pointer"
                                                }}
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </Layout>

    );

}


export default EducatorAnnouncements;