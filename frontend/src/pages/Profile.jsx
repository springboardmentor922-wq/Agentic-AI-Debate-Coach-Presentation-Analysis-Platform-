import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
    FaUser,
    FaGraduationCap,
    FaLaptopCode,
    FaChartBar,
    FaTrophy,
    FaStar,
    FaChartLine,
    FaMedal,
    FaEdit,
    FaSave,
    FaTimes,
    FaBook,
    FaBrain,
    FaMicrophone,
    FaBullseye,
} from "react-icons/fa";

import { getDashboardSummary } from "../services/dashboardService";
import "../styles/profile.css";

function Profile() {

    const [user, setUser] = useState(null);

    const [summary, setSummary] = useState(null);

    const [editingPersonal, setEditingPersonal] =
        useState(false);

    const [editingAcademic, setEditingAcademic] =
        useState(false);

    const [editingSkills, setEditingSkills] =
        useState(false);


    const [personalForm, setPersonalForm] = useState({
        full_name: "",
        username: "",
        email: "",
    });


    const [academicForm, setAcademicForm] = useState({
        college: "",
        degree: "",
        year: "",
    });


    const [skills, setSkills] = useState([
        "Debating",
        "Public Speaking",
        "Critical Thinking",
        "Argumentation",
        "Communication",
    ]);


    const [newSkill, setNewSkill] = useState("");


    useEffect(() => {

        loadUser();

        loadPerformance();

    }, []);


    function loadUser() {

        const storedUser =
            JSON.parse(
                localStorage.getItem("user")
            );

        if (!storedUser) {
            return;
        }


        setUser(storedUser);


        setPersonalForm({
            full_name:
                storedUser.full_name || "",

            username:
                storedUser.username || "",

            email:
                storedUser.email || "",
        });


        setAcademicForm({
            college:
                storedUser.college || "",

            degree:
                storedUser.degree || "",

            year:
                storedUser.year || "",
        });


        if (
            Array.isArray(
                storedUser.skills
            )
        ) {

            setSkills(
                storedUser.skills
            );

        }

    }


    async function loadPerformance() {

        try {

            const data =
                await getDashboardSummary();

            setSummary(data);

        } catch (error) {

            console.error(
                "Failed to load profile performance:",
                error
            );

        }

    }


    function savePersonalInfo() {

        const updatedUser = {
            ...user,
            full_name:
                personalForm.full_name,

            username:
                personalForm.username,

            email:
                personalForm.email,
        };


        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );


        setUser(updatedUser);

        setEditingPersonal(false);

    }


    function saveAcademicInfo() {

        const updatedUser = {
            ...user,

            college:
                academicForm.college,

            degree:
                academicForm.degree,

            year:
                academicForm.year,
        };


        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );


        setUser(updatedUser);

        setEditingAcademic(false);

    }


    function saveSkills() {

        const updatedUser = {
            ...user,
            skills,
        };


        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );


        setUser(updatedUser);

        setEditingSkills(false);

    }


    function addSkill() {

        const trimmed =
            newSkill.trim();


        if (!trimmed) {
            return;
        }


        if (
            skills.some(
                (skill) =>
                    skill.toLowerCase() ===
                    trimmed.toLowerCase()
            )
        ) {

            return;

        }


        setSkills([
            ...skills,
            trimmed,
        ]);


        setNewSkill("");

    }


    function removeSkill(skillToRemove) {

        setSkills(
            skills.filter(
                (skill) =>
                    skill !== skillToRemove
            )
        );

    }


    if (!user) {

        return (

            <Layout>

                <div className="dashboard-page">

                    <div className="profile-empty">

                        <h2>
                            Profile
                        </h2>

                        <p>
                            User information not found.
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div className="profile-page">


                {/* =========================
                    PROFILE HEADER
                ========================== */}

                <div className="profile-hero">


                    <div className="profile-identity">


                        <div className="profile-avatar">

                            {user.full_name
                                ?.charAt(0)
                                .toUpperCase() || "U"}

                        </div>


                        <div className="profile-identity-text">

                            <div className="profile-name-row">

                                <h1>
                                    {user.full_name}
                                </h1>

                                <span className="role-badge">
                                    {user.role ||
                                        "Learner"}
                                </span>

                            </div>


                            <p>
                                Passionate debater and lifelong learner.
                            </p>


                            <div className="profile-meta">

                                <span>
                                    ✉️ {user.email}
                                </span>

                                <span>
                                    🎓 {user.college ||
                                        "College not added"}
                                </span>

                            </div>

                        </div>

                    </div>


                    <button
                        className="profile-edit-main"
                        onClick={() =>
                            setEditingPersonal(true)
                        }
                    >

                        <FaEdit />

                        Edit Profile

                    </button>


                </div>



                {/* =========================
                    PERSONAL INFORMATION
                ========================== */}

                <div className="profile-section">


                    <div className="profile-section-header">

                        <div className="section-title">

                            <div className="section-icon">
                                <FaUser />
                            </div>

                            <h2>
                                Personal Information
                            </h2>

                        </div>


                        {!editingPersonal && (

                            <button
                                className="section-edit-btn"
                                onClick={() =>
                                    setEditingPersonal(true)
                                }
                            >

                                <FaEdit />

                                Edit

                            </button>

                        )}

                    </div>


                    {editingPersonal ? (

                        <div className="profile-form">


                            <div className="form-field">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    value={
                                        personalForm.full_name
                                    }
                                    onChange={(e) =>
                                        setPersonalForm({
                                            ...personalForm,
                                            full_name:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Username
                                </label>

                                <input
                                    value={
                                        personalForm.username
                                    }
                                    onChange={(e) =>
                                        setPersonalForm({
                                            ...personalForm,
                                            username:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        personalForm.email
                                    }
                                    onChange={(e) =>
                                        setPersonalForm({
                                            ...personalForm,
                                            email:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>


                            <div className="form-actions">

                                <button
                                    className="save-btn"
                                    onClick={
                                        savePersonalInfo
                                    }
                                >

                                    <FaSave />

                                    Save Changes

                                </button>


                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setEditingPersonal(false)
                                    }
                                >

                                    <FaTimes />

                                    Cancel

                                </button>

                            </div>

                        </div>

                    ) : (

                        <div className="info-grid">


                            <InfoItem
                                label="Full Name"
                                value={
                                    user.full_name
                                }
                            />


                            <InfoItem
                                label="Username"
                                value={
                                    user.username ||
                                    "Not available"
                                }
                            />


                            <InfoItem
                                label="Email"
                                value={
                                    user.email
                                }
                            />


                            <InfoItem
                                label="Role"
                                value={
                                    user.role ||
                                    "Learner"
                                }
                            />

                        </div>

                    )}

                </div>



                {/* =========================
                    ACADEMIC INFORMATION
                ========================== */}

                <div className="profile-section">


                    <div className="profile-section-header">

                        <div className="section-title">

                            <div className="section-icon">
                                <FaGraduationCap />
                            </div>

                            <h2>
                                Academic Information
                            </h2>

                        </div>


                        {!editingAcademic && (

                            <button
                                className="section-edit-btn"
                                onClick={() =>
                                    setEditingAcademic(true)
                                }
                            >

                                <FaEdit />

                                Edit

                            </button>

                        )}

                    </div>


                    {editingAcademic ? (

                        <div className="profile-form">


                            <div className="form-field">

                                <label>
                                    College / University
                                </label>

                                <input
                                    placeholder="Enter your college"
                                    value={
                                        academicForm.college
                                    }
                                    onChange={(e) =>
                                        setAcademicForm({
                                            ...academicForm,
                                            college:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Degree
                                </label>

                                <input
                                    placeholder="Example: B.Tech CSE"
                                    value={
                                        academicForm.degree
                                    }
                                    onChange={(e) =>
                                        setAcademicForm({
                                            ...academicForm,
                                            degree:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Academic Year
                                </label>

                                <input
                                    placeholder="Example: 3rd Year"
                                    value={
                                        academicForm.year
                                    }
                                    onChange={(e) =>
                                        setAcademicForm({
                                            ...academicForm,
                                            year:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>


                            <div className="form-actions">

                                <button
                                    className="save-btn"
                                    onClick={
                                        saveAcademicInfo
                                    }
                                >

                                    <FaSave />

                                    Save Changes

                                </button>


                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setEditingAcademic(false)
                                    }
                                >

                                    <FaTimes />

                                    Cancel

                                </button>

                            </div>

                        </div>

                    ) : (

                        <div className="info-grid academic-grid">


                            <InfoItem
                                label="College / University"
                                value={
                                    user.college ||
                                    "Not added"
                                }
                            />


                            <InfoItem
                                label="Degree"
                                value={
                                    user.degree ||
                                    "Not added"
                                }
                            />


                            <InfoItem
                                label="Academic Year"
                                value={
                                    user.year ||
                                    "Not added"
                                }
                            />

                        </div>

                    )}

                </div>



                {/* =========================
                    SKILLS
                ========================== */}

                <div className="profile-section">


                    <div className="profile-section-header">

                        <div className="section-title">

                            <div className="section-icon">
                                <FaLaptopCode />
                            </div>

                            <h2>
                                Skills
                            </h2>

                        </div>


                        {!editingSkills && (

                            <button
                                className="section-edit-btn"
                                onClick={() =>
                                    setEditingSkills(true)
                                }
                            >

                                <FaEdit />

                                Edit

                            </button>

                        )}

                    </div>


                    {editingSkills ? (

                        <div className="skills-editor">


                            <div className="skill-input-row">

                                <input
                                    placeholder="Add a skill..."
                                    value={newSkill}
                                    onChange={(e) =>
                                        setNewSkill(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {

                                        if (
                                            e.key === "Enter"
                                        ) {
                                            addSkill();
                                        }

                                    }}
                                />


                                <button
                                    className="add-skill-btn"
                                    onClick={addSkill}
                                >
                                    Add
                                </button>

                            </div>


                            <div className="skills-list">

                                {skills.map(
                                    (skill) => (

                                        <div
                                            className="skill-tag editable"
                                            key={skill}
                                        >

                                            {skill}

                                            <button
                                                onClick={() =>
                                                    removeSkill(
                                                        skill
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="form-actions">

                                <button
                                    className="save-btn"
                                    onClick={saveSkills}
                                >

                                    <FaSave />

                                    Save Skills

                                </button>


                                <button
                                    className="cancel-btn"
                                    onClick={() =>
                                        setEditingSkills(false)
                                    }
                                >

                                    <FaTimes />

                                    Cancel

                                </button>

                            </div>

                        </div>

                    ) : (

                        <div className="skills-list">

                            {skills.map(
                                (skill) => (

                                    <span
                                        className="skill-tag"
                                        key={skill}
                                    >
                                        {skill}
                                    </span>

                                )
                            )}

                        </div>

                    )}

                </div>



                {/* =========================
                    DEBATE PERFORMANCE
                ========================== */}

                <div className="profile-section">


                    <div className="profile-section-header">

                        <div className="section-title">

                            <div className="section-icon">
                                <FaChartBar />
                            </div>

                            <h2>
                                Debate Performance
                            </h2>

                        </div>


                        <button
                            className="section-edit-btn"
                            onClick={() =>
                                window.location.href =
                                    "/reports"
                            }
                        >

                            View Details

                        </button>

                    </div>


                    <div className="performance-grid">


                        <PerformanceCard
                            icon={<FaTrophy />}
                            title="Total Debates"
                            value={
                                summary?.total_debates ?? 0
                            }
                            subtitle="Debates completed"
                        />


                        <PerformanceCard
                            icon={<FaStar />}
                            title="Average Score"
                            value={`${summary?.average_score ?? 0}%`}
                            subtitle="Your average performance"
                        />


                        <PerformanceCard
                            icon={<FaChartLine />}
                            title="Highest Score"
                            value={`${summary?.highest_score ?? 0}%`}
                            subtitle="Your best performance"
                        />


                        <PerformanceCard
                            icon={<FaMedal />}
                            title="Current Grade"
                            value={
                                summary?.grade ||
                                "N/A"
                            }
                            subtitle="Keep improving!"
                        />

                    </div>



                    {/* SKILL SCORES */}

                    <div className="skill-performance">


                        <h3>
                            Skill-wise Average Scores
                        </h3>


                        <div className="skill-performance-grid">


                            <ScoreBar
                                icon={<FaBook />}
                                title="Grammar"
                                value={
                                    summary?.average_grammar ??
                                    0
                                }
                            />


                            <ScoreBar
                                icon={<FaBrain />}
                                title="Logic"
                                value={
                                    summary?.average_logic ??
                                    0
                                }
                            />


                            <ScoreBar
                                icon={<FaMicrophone />}
                                title="Confidence"
                                value={
                                    summary?.average_confidence ??
                                    0
                                }
                            />


                            <ScoreBar
                                icon={<FaBullseye />}
                                title="Relevance"
                                value={
                                    summary?.average_relevance ??
                                    0
                                }
                            />

                        </div>

                    </div>

                </div>


            </div>

        </Layout>

    );

}



function InfoItem({
    label,
    value,
}) {

    return (

        <div className="info-item">

            <span>
                {label}
            </span>

            <strong>
                {value || "Not available"}
            </strong>

        </div>

    );

}



function PerformanceCard({
    icon,
    title,
    value,
    subtitle,
}) {

    return (

        <div className="performance-card">

            <div className="performance-icon">

                {icon}

            </div>


            <div>

                <span>
                    {title}
                </span>

                <h3>
                    {value}
                </h3>

                <small>
                    {subtitle}
                </small>

            </div>

        </div>

    );

}



function ScoreBar({
    icon,
    title,
    value,
}) {

    const score =
        Number(value || 0);


    const percentage =
        Math.min(
            Math.max(score * 10, 0),
            100
        );


    return (

        <div className="score-item">


            <div className="score-title">

                <div>

                    <span className="score-icon">
                        {icon}
                    </span>

                    <strong>
                        {title}
                    </strong>

                </div>


                <span>
                    {score.toFixed(1)}/10
                </span>

            </div>


            <div className="score-track">

                <div
                    className="score-fill"
                    style={{
                        width:
                            `${percentage}%`,
                    }}
                />

            </div>

        </div>

    );

}


export default Profile;