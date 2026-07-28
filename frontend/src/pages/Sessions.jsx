import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import {
    getSessions,
    deleteSession
} from "../services/sessionService";

export default function Sessions() {

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [sort, setSort] = useState("newest");

    const [page, setPage] = useState(1);
    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        loadSessions(search, status, sort, page);
    }, [search, status, sort, page]);

    async function loadSessions(
        searchText = "",
        statusValue = "All",
        sortValue = "newest",
        pageValue = 1
    ) {

        setLoading(true);

        try {

            const data = await getSessions(
                searchText,
                statusValue,
                sortValue,
                pageValue,
                pageSize
            );

            setSessions(data.sessions || []);
            setTotalPages(data.total_pages || 1);

        } catch (error) {

            console.error(error);
            setSessions([]);

        } finally {

            setLoading(false);

        }

    }

    async function handleDelete(id) {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this debate session?"
        );

        if (!confirmDelete) return;

        const result = await deleteSession(id);

        alert(result.message);

        loadSessions(search, status, sort, page);

    }

    return (

        <DashboardLayout>

            <h1>My Debate Sessions</h1>

            <br />

            <button
                onClick={() => navigate("/create-session")}
            >
                + Create New Session
            </button>

            <br /><br />

            {/* Search Box */}

            <input
                type="text"
                placeholder="🔍 Search by title or topic..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
                style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "16px"
                }}
            />

            {/* Filters */}

            <div
                style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "25px"
                }}
            >

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    style={{
                        width: "200px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "16px"
                    }}
                >
                    <option value="All">All Sessions</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                </select>

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                    style={{
                        width: "200px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontSize: "16px"
                    }}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Score</option>
                    <option value="lowest">Lowest Score</option>
                </select>

            </div>

            {loading ? (

                <h2>Loading...</h2>

            ) : sessions.length === 0 ? (

                <p>No Debate Sessions Found.</p>

            ) : (

                sessions.map((session) => (

                    <div
                        key={session.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                        }}
                    >

                        <h3
                            style={{
                                color: "#2563eb",
                                cursor: "pointer",
                                textDecoration: "underline"
                            }}
                            onClick={() => navigate(`/sessions/${session.id}`)}
                        >
                            {session.title}
                        </h3>

                        <p>
                            <strong>Topic:</strong> {session.topic}
                        </p>

                        <p>
                            <strong>Position:</strong> {session.position}
                        </p>

                        <p>
                            <strong>Status:</strong> {session.status || "N/A"}
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/edit-session/${session.id}`)
                            }
                        >
                            Edit
                        </button>

                        <button
                            style={{ marginLeft: "10px" }}
                            onClick={() =>
                                handleDelete(session.id)
                            }
                        >
                            Delete
                        </button>

                    </div>

                ))

            )}

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "20px",
                    marginTop: "30px"
                }}
            >
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>

        </DashboardLayout>

    );

}