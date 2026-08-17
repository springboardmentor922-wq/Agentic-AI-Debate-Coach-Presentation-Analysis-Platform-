import { useEffect, useState } from "react";

import {
    FaUsers,
    FaGraduationCap,
    FaUserTie,
    FaUniversity,
    FaChartBar,
    FaMedal,
    FaCalendarCheck,
    FaClock,
    FaRobot,
    FaDatabase,
    FaServer,
    FaCheckCircle,
    FaExclamationTriangle,
    FaShieldAlt,
} from "react-icons/fa";

import AdminLayout from "../components/AdminLayout";

import {
    getAdminDashboardSummary,
} from "../services/adminService";
import "../styles/adminDashboard.css";

function AdminDashboard() {

    // ==========================================
    // STATE
    // ==========================================

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD REAL DATA FROM BACKEND
    // ==========================================

    useEffect(() => {

        loadDashboard();

    }, []);


    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError("");

            const result =
                await getAdminDashboardSummary();

            console.log(
                "Admin Dashboard Data:",
                result
            );

            setData(result);

        } catch (err) {

            console.error(
                "Failed to load admin dashboard:",
                err
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <AdminLayout>

                <div className="admin-dashboard">

                    <div className="admin-card">

                        <h2>
                            Loading Admin Dashboard...
                        </h2>

                        <p>
                            Fetching real data from the database.
                        </p>

                    </div>

                </div>

            </AdminLayout>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <AdminLayout>

                <div className="admin-dashboard">

                    <div
                        className="admin-card"
                        style={{
                            padding: "30px",
                            textAlign: "center"
                        }}
                    >

                        <FaExclamationTriangle
                            size={40}
                            style={{
                                color: "#EF4444",
                                marginBottom: "15px"
                            }}
                        />

                        <h2>
                            Something went wrong
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={loadDashboard}
                            className="admin-primary-btn"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </AdminLayout>

        );

    }


    // ==========================================
    // SAFETY CHECK
    // ==========================================

    if (!data) {

        return null;

    }


    // ==========================================
    // ROLE PERCENTAGES
    // ==========================================

    const totalUsers =
        Number(data.total_users || 0);


    const learnerPercentage =
        totalUsers > 0
            ? (
                Number(data.learners || 0)
                / totalUsers
                * 100
            ).toFixed(1)
            : "0";


    const coachPercentage =
        totalUsers > 0
            ? (
                Number(data.coaches || 0)
                / totalUsers
                * 100
            ).toFixed(1)
            : "0";


    const educatorPercentage =
        totalUsers > 0
            ? (
                Number(data.educators || 0)
                / totalUsers
                * 100
            ).toFixed(1)
            : "0";


    const adminPercentage =
        totalUsers > 0
            ? (
                Number(data.administrators || 0)
                / totalUsers
                * 100
            ).toFixed(1)
            : "0";


    return (

        <AdminLayout>

            <div className="admin-dashboard">


                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="admin-dashboard-header">

                    <div>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Overview of platform operations
                            and performance.
                        </p>

                    </div>

                </div>



                {/* =====================================
                    STATISTICS
                ====================================== */}

                <div className="admin-stats-grid">


                    <AdminStat
                        icon={<FaUsers />}
                        title="Total Users"
                        value={data.total_users}
                        color="purple"
                    />


                    <AdminStat
                        icon={<FaGraduationCap />}
                        title="Learners"
                        value={data.learners}
                        color="blue"
                    />


                    <AdminStat
                        icon={<FaUserTie />}
                        title="Coaches"
                        value={data.coaches}
                        color="green"
                    />


                    <AdminStat
                        icon={<FaUniversity />}
                        title="Educators"
                        value={data.educators}
                        color="orange"
                    />


                    <AdminStat
                        icon={<FaChartBar />}
                        title="Debates Conducted"
                        value={data.debates_conducted}
                        color="pink"
                    />


                    <AdminStat
                        icon={<FaMedal />}
                        title="Avg. Platform Score"
                        value={data.average_platform_score}
                        suffix="/100"
                        color="teal"
                    />

                </div>



                {/* =====================================
                    MAIN GRID
                ====================================== */}

                <div className="admin-main-grid">


                    {/* =================================
                        PLATFORM OVERVIEW
                    ================================== */}

                    <div className="admin-card">

                        <div className="admin-card-header">

                            <h3>
                                Platform Overview
                            </h3>

                        </div>


                        <div className="platform-overview">


                            <OverviewRow
                                icon={<FaUsers />}
                                title="Total Users"
                                value={data.total_users}
                            />


                            <OverviewRow
                                icon={<FaGraduationCap />}
                                title="Learners"
                                value={data.learners}
                            />


                            <OverviewRow
                                icon={<FaUserTie />}
                                title="Coaches"
                                value={data.coaches}
                            />


                            <OverviewRow
                                icon={<FaUniversity />}
                                title="Educators"
                                value={data.educators}
                            />


                            <OverviewRow
                                icon={<FaCalendarCheck />}
                                title="Debates Conducted"
                                value={data.debates_conducted}
                            />


                            <OverviewRow
                                icon={<FaMedal />}
                                title="Average Platform Score"
                                value={`${data.average_platform_score}/100`}
                            />


                        </div>

                    </div>



                    {/* =================================
                        USER ROLE DISTRIBUTION
                    ================================== */}

                    <div className="admin-card">

                        <div className="admin-card-header">

                            <h3>
                                User Role Distribution
                            </h3>

                        </div>


                        <div className="role-distribution">


                            <div className="role-total">

                                <strong>
                                    {data.total_users}
                                </strong>

                                <span>
                                    Total Users
                                </span>

                            </div>


                            <RoleRow
                                color="#6D28D9"
                                title="Learners"
                                value={data.learners}
                                percentage={`${learnerPercentage}%`}
                            />


                            <RoleRow
                                color="#2563EB"
                                title="Coaches"
                                value={data.coaches}
                                percentage={`${coachPercentage}%`}
                            />


                            <RoleRow
                                color="#16A34A"
                                title="Educators"
                                value={data.educators}
                                percentage={`${educatorPercentage}%`}
                            />


                            <RoleRow
                                color="#F97316"
                                title="Administrators"
                                value={data.administrators}
                                percentage={`${adminPercentage}%`}
                            />


                        </div>

                    </div>

                </div>



                {/* =====================================
                    SECOND ROW
                ====================================== */}

                <div className="admin-main-grid">


                    {/* =================================
                        SYSTEM STATUS
                    ================================== */}

                    <div className="admin-card">

                        <div className="admin-card-header">

                            <h3>
                                System Overview
                            </h3>

                        </div>


                        <div className="system-status">


                            <SystemStatus
                                icon={<FaServer />}
                                title="Web Server"
                            />


                            <SystemStatus
                                icon={<FaDatabase />}
                                title="Database"
                            />


                            <SystemStatus
                                icon={<FaRobot />}
                                title="AI Services"
                            />


                            <SystemStatus
                                icon={<FaShieldAlt />}
                                title="Authentication"
                            />


                        </div>

                    </div>



                    {/* =================================
                        DEBATE PERFORMANCE
                    ================================== */}

                    <div className="admin-card">

                        <div className="admin-card-header">

                            <h3>
                                Debate Performance
                            </h3>

                        </div>


                        <div
                            style={{
                                textAlign: "center",
                                padding: "25px"
                            }}
                        >

                            <FaChartBar
                                size={45}
                                style={{
                                    color: "#6D28D9",
                                    marginBottom: "15px"
                                }}
                            />

                            <h2>
                                {data.debates_conducted}
                            </h2>

                            <p>
                                Total Debates Conducted
                            </p>


                            <div
                                style={{
                                    marginTop: "25px"
                                }}
                            >

                                <h4>
                                    Average Platform Score
                                </h4>

                                <div
                                    style={{
                                        fontSize: "36px",
                                        fontWeight: "700",
                                        color: "#6D28D9"
                                    }}
                                >
                                    {data.average_platform_score}
                                    <span
                                        style={{
                                            fontSize: "18px",
                                            color: "#64748B"
                                        }}
                                    >
                                        /100
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>



                {/* =====================================
                    REAL DATA NOTICE
                ====================================== */}

                <div
                    className="admin-card"
                    style={{
                        marginTop: "20px",
                        padding: "20px"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                        }}
                    >

                        <FaCheckCircle
                            style={{
                                color: "#16A34A"
                            }}
                        />

                        <div>

                            <strong>
                                Live Database Data
                            </strong>

                            <p
                                style={{
                                    margin: "4px 0 0",
                                    color: "#64748B"
                                }}
                            >
                                Dashboard statistics are
                                loaded directly from the
                                PostgreSQL database.
                            </p>

                        </div>

                    </div>

                </div>


            </div>

        </AdminLayout>

    );

}



/* ==================================================
   STAT CARD
================================================== */

function AdminStat({
    icon,
    title,
    value,
    suffix = "",
    color
}) {

    return (

        <div className="admin-stat-card">

            <div
                className={`admin-stat-icon ${color}`}
            >
                {icon}
            </div>


            <div className="admin-stat-content">

                <p>
                    {title}
                </p>

                <h2>

                    {value}

                    {suffix && (

                        <span
                            style={{
                                fontSize: "15px",
                                marginLeft: "5px",
                                color: "#64748B"
                            }}
                        >
                            {suffix}
                        </span>

                    )}

                </h2>

            </div>

        </div>

    );

}



/* ==================================================
   OVERVIEW ROW
================================================== */

function OverviewRow({
    icon,
    title,
    value
}) {

    return (

        <div className="overview-row">

            <div className="overview-left">

                <div className="overview-icon">
                    {icon}
                </div>

                <span>
                    {title}
                </span>

            </div>


            <strong>
                {value}
            </strong>

        </div>

    );

}



/* ==================================================
   ROLE ROW
================================================== */

function RoleRow({
    color,
    title,
    value,
    percentage
}) {

    return (

        <div className="role-row">

            <div
                className="role-color"
                style={{
                    background: color
                }}
            />


            <div className="role-name">

                <span>
                    {title}
                </span>

            </div>


            <strong>
                {value}
            </strong>


            <span className="role-percentage">
                {percentage}
            </span>

        </div>

    );

}



/* ==================================================
   SYSTEM STATUS
================================================== */

function SystemStatus({
    icon,
    title
}) {

    return (

        <div className="system-status-row">

            <div className="system-status-left">

                <div className="system-icon">
                    {icon}
                </div>

                <span>
                    {title}
                </span>

            </div>


            <div className="system-operational">

                <span className="status-dot" />

                Operational

            </div>

        </div>

    );

}


export default AdminDashboard;