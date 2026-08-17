import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import {
    getEducatorClasses,
    createEducatorClass,
    updateEducatorClass,
    deleteEducatorClass
} from "../services/educatorClassService";

import {
    FaPlus,
    FaUsers,
    FaChartLine,
    FaTrophy,
    FaEdit,
    FaTrash,
    FaEye,
    FaTimes
} from "react-icons/fa";

import "../styles/myClasses.css";


function MyClasses() {

    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [showModal, setShowModal] =
        useState(false);

    const [editingClass, setEditingClass] =
        useState(null);

    const [name, setName] = useState("");

    const [description, setDescription] =
        useState("");

    const [saving, setSaving] = useState(false);


    // ==========================================
    // LOAD CLASSES
    // ==========================================

    useEffect(() => {

        loadClasses();

    }, []);


    const loadClasses = async () => {

        try {

            setLoading(true);

            setError("");

            const data =
                await getEducatorClasses();

            console.log(
                "EDUCATOR CLASSES:",
                data
            );

            setClasses(data || []);

        } catch (err) {

            console.error(
                "Failed to load classes:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load classes."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // OPEN CREATE MODAL
    // ==========================================

    const openCreateModal = () => {

        setEditingClass(null);

        setName("");

        setDescription("");

        setShowModal(true);

    };


    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const openEditModal = (classroom) => {

        setEditingClass(classroom);

        setName(
            classroom.name || ""
        );

        setDescription(
            classroom.description || ""
        );

        setShowModal(true);

    };


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingClass(null);

        setName("");

        setDescription("");

    };


    // ==========================================
    // SAVE CLASS
    // ==========================================

    const handleSave = async (e) => {

        e.preventDefault();

        if (!name.trim()) {

            alert(
                "Please enter a classroom name."
            );

            return;

        }


        try {

            setSaving(true);


            if (editingClass) {

                await updateEducatorClass(
                    editingClass.id,
                    name.trim(),
                    description.trim()
                );

            } else {

                await createEducatorClass(
                    name.trim(),
                    description.trim()
                );

            }


            closeModal();

            await loadClasses();

        } catch (err) {

            console.error(
                "Failed to save class:",
                err
            );

            alert(
                err?.response?.data?.detail ||
                "Unable to save classroom."
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // DELETE CLASS
    // ==========================================

    const handleDelete = async (classroom) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${classroom.name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteEducatorClass(
                classroom.id
            );

            await loadClasses();

        } catch (err) {

            console.error(
                "Failed to delete class:",
                err
            );

            alert(
                err?.response?.data?.detail ||
                "Unable to delete classroom."
            );

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <Layout>

                <div className="classes-page">

                    <div className="classes-loading">

                        <h2>
                            Loading classrooms...
                        </h2>

                    </div>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div className="classes-page">


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="classes-header">

                    <div>

                        <h1>
                            My Classes
                        </h1>

                        <p>
                            Create and manage your
                            classrooms and learners.
                        </p>

                    </div>


                    <button
                        className="create-class-button"
                        onClick={
                            openCreateModal
                        }
                    >

                        <FaPlus />

                        Create Class

                    </button>

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="classes-error">

                        {error}

                    </div>

                )}


                {/* ==================================
                    EMPTY STATE
                ================================== */}

                {classes.length === 0 ? (

                    <div className="empty-classes">

                        <div className="empty-icon">

                            <FaUsers />

                        </div>

                        <h2>
                            No Classes Yet
                        </h2>

                        <p>
                            Create your first classroom
                            to start adding learners.
                        </p>

                        <button
                            className="create-class-button"
                            onClick={
                                openCreateModal
                            }
                        >

                            <FaPlus />

                            Create Your First Class

                        </button>

                    </div>

                ) : (

                    /* ==================================
                       CLASS GRID
                    ================================== */

                    <div className="classes-grid">

                        {classes.map(
                            (classroom) => (

                                <ClassCard
                                    key={
                                        classroom.id
                                    }
                                    classroom={
                                        classroom
                                    }
                                    onView={() =>
                                        navigate(
                                            `/educator/classes/${classroom.id}`
                                        )
                                    }
                                    onEdit={() =>
                                        openEditModal(
                                            classroom
                                        )
                                    }
                                    onDelete={() =>
                                        handleDelete(
                                            classroom
                                        )
                                    }
                                />

                            )
                        )}

                    </div>

                )}


                {/* ==================================
                    CREATE / EDIT MODAL
                ================================== */}

                {showModal && (

                    <div
                        className="modal-overlay"
                        onMouseDown={(e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                closeModal();
                            }

                        }}
                    >

                        <div className="class-modal">

                            <div className="modal-header">

                                <div>

                                    <h2>
                                        {editingClass
                                            ? "Edit Class"
                                            : "Create Class"}
                                    </h2>

                                    <p>
                                        {editingClass
                                            ? "Update classroom information."
                                            : "Create a new classroom for your learners."}
                                    </p>

                                </div>


                                <button
                                    className="modal-close"
                                    onClick={
                                        closeModal
                                    }
                                >

                                    <FaTimes />

                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleSave
                                }
                            >

                                <div className="form-group">

                                    <label>
                                        Class Name
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        placeholder="e.g. Advanced Debate - 2026"
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        value={
                                            description
                                        }
                                        placeholder="Describe this classroom..."
                                        rows="4"
                                        onChange={(e) =>
                                            setDescription(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="save-button"
                                        disabled={
                                            saving
                                        }
                                    >

                                        {saving
                                            ? "Saving..."
                                            : editingClass
                                                ? "Update Class"
                                                : "Create Class"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </div>

        </Layout>

    );

}


/* ==========================================
   CLASS CARD
========================================== */

function ClassCard({
    classroom,
    onView,
    onEdit,
    onDelete
}) {

    const studentCount =
        classroom.student_count ?? 0;

    const averageScore =
        classroom.average_score ?? 0;

    const topPerformer =
        classroom.top_performer || {};


    return (

        <div className="class-card">


            {/* CARD HEADER */}

            <div className="class-card-header">

                <div className="class-icon">

                    <FaUsers />

                </div>


                <div className="class-actions">

                    <button
                        className="class-action edit"
                        title="Edit Class"
                        onClick={onEdit}
                    >

                        <FaEdit />

                    </button>


                    <button
                        className="class-action delete"
                        title="Delete Class"
                        onClick={onDelete}
                    >

                        <FaTrash />

                    </button>

                </div>

            </div>


            {/* CLASS INFO */}

            <h2>
                {classroom.name}
            </h2>


            <p className="class-description">

                {classroom.description ||
                    "No description added."}

            </p>


            {/* STATS */}

            <div className="class-stats">


                <div className="class-stat">

                    <FaUsers />

                    <div>

                        <span>
                            Learners
                        </span>

                        <strong>
                            {studentCount}
                        </strong>

                    </div>

                </div>


                <div className="class-stat">

                    <FaChartLine />

                    <div>

                        <span>
                            Avg. Score
                        </span>

                        <strong>
                            {averageScore}%
                        </strong>

                    </div>

                </div>

            </div>


            {/* TOP PERFORMER */}

            <div className="top-performer">

                <div className="top-icon">

                    <FaTrophy />

                </div>


                <div>

                    <span>
                        Top Performer
                    </span>

                    <strong>
                        {topPerformer.name ||
                            "No data"}
                    </strong>

                    {topPerformer.name &&
                        topPerformer.name !==
                        "N/A" && (

                        <small>
                            {topPerformer.score}%
                        </small>

                    )}

                </div>

            </div>


            {/* VIEW */}

            <button
                className="view-class-button"
                onClick={onView}
            >

                <FaEye />

                View Class

            </button>

        </div>

    );

}


export default MyClasses;