import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import {
    FaPlus,
    FaTrash,
    FaBook,
    FaUsers,
    FaUser,
    FaCalendarAlt
} from "react-icons/fa";

import {
    getEducatorAssignments,
    createAssignment,
    deleteAssignment
} from "../services/assignmentService";

import {
    getEducatorClasses,
    getAvailableLearners
} from "../services/educatorClassService";


function Assignments() {

    const [assignments, setAssignments] =
        useState([]);

    const [classes, setClasses] =
        useState([]);

    const [learners, setLearners] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [targetType, setTargetType] =
        useState("class");

    const [form, setForm] = useState({

        title: "",

        description: "",

        category: "",

        difficulty: "Medium",

        due_date: "",

        classroom_id: "",

        learner_id: ""

    });


    // ========================================================
    // LOAD
    // ========================================================

    useEffect(() => {

        loadData();

    }, []);


    const loadData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                assignmentData,
                classData
            ] = await Promise.all([

                getEducatorAssignments(),

                getEducatorClasses()

            ]);


            setAssignments(
                assignmentData || []
            );

            setClasses(
                classData || []
            );


            // ------------------------------------------------
            // LOAD LEARNERS FROM ALL CLASSES
            // ------------------------------------------------

            let allLearners = [];

            for (
                const classroom of classData || []
            ) {

                try {

                    const data =
                        await getAvailableLearners(
                            classroom.id
                        );

                    allLearners = [
                        ...allLearners,
                        ...(data || [])
                    ];

                } catch (error) {

                    console.log(
                        "Learners unavailable for class",
                        classroom.id
                    );

                }

            }


            // Remove duplicates

            const uniqueLearners =
                allLearners.filter(

                    (learner, index, array) =>

                        index ===
                        array.findIndex(
                            item =>
                                item.id ===
                                learner.id
                        )

                );


            setLearners(
                uniqueLearners
            );


        } catch (err) {

            console.error(err);

            setError(

                err?.response?.data?.detail ||

                "Unable to load assignments."

            );

        } finally {

            setLoading(false);

        }

    };


    // ========================================================
    // FORM CHANGE
    // ========================================================

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]:
                e.target.value

        });

    };


    // ========================================================
    // TARGET TYPE
    // ========================================================

    const changeTargetType = (
        type
    ) => {

        setTargetType(type);

        setForm({

            ...form,

            classroom_id: "",

            learner_id: ""

        });

    };


    // ========================================================
    // CREATE
    // ========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");


        if (!form.title.trim()) {

            setError(
                "Please enter an assignment title."
            );

            return;

        }


        if (
            targetType === "class" &&
            !form.classroom_id
        ) {

            setError(
                "Please select a class."
            );

            return;

        }


        if (
            targetType === "learner" &&
            !form.learner_id
        ) {

            setError(
                "Please select a learner."
            );

            return;

        }


        try {

            setSaving(true);


            const payload = {

                title:
                    form.title.trim(),

                description:
                    form.description.trim(),

                category:
                    form.category.trim(),

                difficulty:
                    form.difficulty,

                due_date:
                    form.due_date || null,

                classroom_id:
                    targetType === "class"
                        ? Number(
                            form.classroom_id
                        )
                        : null,

                learner_id:
                    targetType === "learner"
                        ? Number(
                            form.learner_id
                        )
                        : null

            };


            await createAssignment(
                payload
            );


            alert(
                "Assignment created successfully!"
            );


            setForm({

                title: "",

                description: "",

                category: "",

                difficulty: "Medium",

                due_date: "",

                classroom_id: "",

                learner_id: ""

            });


            await loadData();


        } catch (err) {

            console.error(err);

            setError(

                err?.response?.data?.detail ||

                "Unable to create assignment."

            );

        } finally {

            setSaving(false);

        }

    };


    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Delete this assignment?"
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteAssignment(id);

            await loadData();

        } catch (err) {

            console.error(err);

            alert(

                err?.response?.data?.detail ||

                "Unable to delete assignment."

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
                        Loading assignments...
                    </h2>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div
                style={{
                    padding: "30px",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >

                {/* HEADER */}

                <div
                    style={{
                        marginBottom: "30px"
                    }}
                >

                    <h1>
                        Assignments
                    </h1>

                    <p
                        style={{
                            color: "#64748b"
                        }}
                    >
                        Create debate topics and
                        assign them to learners or
                        entire classes.
                    </p>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        style={{
                            background:
                                "#fee2e2",
                            color:
                                "#b91c1c",
                            padding:
                                "15px",
                            borderRadius:
                                "10px",
                            marginBottom:
                                "20px"
                        }}
                    >

                        {error}

                    </div>

                )}


                {/* CREATE ASSIGNMENT */}

                <div
                    style={{
                        background: "white",
                        padding: "28px",
                        borderRadius: "18px",
                        marginBottom: "30px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,.06)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            marginBottom: "20px"
                        }}
                    >

                        <FaPlus />

                        <h2
                            style={{
                                margin: 0
                            }}
                        >
                            Create Assignment
                        </h2>

                    </div>


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* TITLE */}

                        <input
                            name="title"
                            value={
                                form.title
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Assignment / Debate Topic"
                            style={inputStyle}
                        />


                        {/* DESCRIPTION */}

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Instructions for learners..."
                            rows="4"
                            style={inputStyle}
                        />


                        {/* CATEGORY */}

                        <input
                            name="category"
                            value={
                                form.category
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Category e.g. Technology, Education, AI"
                            style={inputStyle}
                        />


                        {/* DIFFICULTY + DATE */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "15px"
                            }}
                        >

                            <select
                                name="difficulty"
                                value={
                                    form.difficulty
                                }
                                onChange={
                                    handleChange
                                }
                                style={inputStyle}
                            >

                                <option value="Easy">
                                    Easy
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="Hard">
                                    Hard
                                </option>

                            </select>


                            <input
                                type="date"
                                name="due_date"
                                value={
                                    form.due_date
                                }
                                onChange={
                                    handleChange
                                }
                                style={inputStyle}
                            />

                        </div>


                        {/* ASSIGN TO */}

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "10px",
                                marginBottom: "15px"
                            }}
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    changeTargetType(
                                        "class"
                                    )
                                }
                                style={{
                                    ...targetButton,
                                    background:
                                        targetType ===
                                        "class"
                                            ? "#5b21b6"
                                            : "#f1f5f9",
                                    color:
                                        targetType ===
                                        "class"
                                            ? "white"
                                            : "#334155"
                                }}
                            >

                                <FaUsers />

                                Assign to Class

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    changeTargetType(
                                        "learner"
                                    )
                                }
                                style={{
                                    ...targetButton,
                                    background:
                                        targetType ===
                                        "learner"
                                            ? "#5b21b6"
                                            : "#f1f5f9",
                                    color:
                                        targetType ===
                                        "learner"
                                            ? "white"
                                            : "#334155"
                                }}
                            >

                                <FaUser />

                                Assign to Learner

                            </button>

                        </div>


                        {/* CLASS */}

                        {targetType === "class" && (

                            <select
                                name="classroom_id"
                                value={
                                    form.classroom_id
                                }
                                onChange={
                                    handleChange
                                }
                                style={inputStyle}
                            >

                                <option value="">
                                    Select Class
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

                                            {
                                                classroom.name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        )}


                        {/* LEARNER */}

                        {targetType === "learner" && (

                            <select
                                name="learner_id"
                                value={
                                    form.learner_id
                                }
                                onChange={
                                    handleChange
                                }
                                style={inputStyle}
                            >

                                <option value="">
                                    Select Learner
                                </option>

                                {learners.map(
                                    learner => (

                                        <option
                                            key={
                                                learner.id
                                            }
                                            value={
                                                learner.id
                                            }
                                        >

                                            {
                                                learner.name
                                            }

                                            {" - "}

                                            {
                                                learner.email
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        )}


                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                marginTop: "15px",
                                background:
                                    "#5b21b6",
                                color: "white",
                                border: "none",
                                padding:
                                    "13px 24px",
                                borderRadius:
                                    "10px",
                                cursor:
                                    "pointer",
                                fontWeight:
                                    "600"
                            }}
                        >

                            <FaPlus />

                            {" "}

                            {saving
                                ? "Creating..."
                                : "Create Assignment"}

                        </button>

                    </form>

                </div>


                {/* EXISTING ASSIGNMENTS */}

                <div
                    style={{
                        background: "white",
                        padding: "28px",
                        borderRadius: "18px",
                        boxShadow:
                            "0 4px 20px rgba(0,0,0,.06)"
                    }}
                >

                    <h2>
                        Created Assignments
                    </h2>


                    {assignments.length === 0 ? (

                        <div
                            style={{
                                textAlign:
                                    "center",
                                padding:
                                    "50px",
                                color:
                                    "#64748b"
                            }}
                        >

                            <FaBook
                                size={40}
                            />

                            <h3>
                                No assignments yet
                            </h3>

                            <p>
                                Create your first
                                assignment above.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                display:
                                    "grid",
                                gap: "15px"
                            }}
                        >

                            {assignments.map(
                                assignment => (

                                    <div
                                        key={
                                            assignment.id
                                        }
                                        style={{
                                            border:
                                                "1px solid #e2e8f0",
                                            borderRadius:
                                                "14px",
                                            padding:
                                                "20px",
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            gap: "20px",
                                            alignItems:
                                                "center"
                                        }}
                                    >

                                        <div>

                                            <h3>
                                                {
                                                    assignment.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    assignment.description
                                                }
                                            </p>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "15px",
                                                    flexWrap:
                                                        "wrap",
                                                    color:
                                                        "#64748b"
                                                }}
                                            >

                                                <span>
                                                    {
                                                        assignment.category ||
                                                        "General"
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        assignment.difficulty
                                                    }
                                                </span>

                                                <span>

                                                    <FaCalendarAlt />

                                                    {" "}

                                                    {
                                                        assignment.due_date ||
                                                        "No due date"
                                                    }

                                                </span>

                                                <span>

                                                    {assignment.classroom_name
                                                        ? `Class: ${assignment.classroom_name}`
                                                        : `Learner: ${assignment.learner_name || assignment.learner_id}`}

                                                </span>

                                            </div>

                                        </div>


                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    assignment.id
                                                )
                                            }
                                            style={{
                                                border:
                                                    "none",
                                                background:
                                                    "#fee2e2",
                                                color:
                                                    "#b91c1c",
                                                padding:
                                                    "10px 13px",
                                                borderRadius:
                                                    "8px",
                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            <FaTrash />

                                        </button>

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


const inputStyle = {

    width: "100%",

    padding: "12px",

    marginBottom: "15px",

    border:
        "1px solid #cbd5e1",

    borderRadius: "9px",

    boxSizing: "border-box",

    fontSize: "14px"

};


const targetButton = {

    border: "none",

    padding: "11px 16px",

    borderRadius: "9px",

    cursor: "pointer",

    display: "flex",

    gap: "8px",

    alignItems: "center",

    fontWeight: "600"

};


export default Assignments;