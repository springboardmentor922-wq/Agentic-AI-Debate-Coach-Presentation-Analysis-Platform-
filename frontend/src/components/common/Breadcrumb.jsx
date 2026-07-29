/*
=========================================================
Breadcrumb

Reusable navigation component.

Used In
--------
- Debate Topics
- Debate Sessions
- Session Details
- Debate Room
- Reports
- Dashboards

=========================================================
*/

import React from "react";
import { Link } from "react-router-dom";
import { getDashboardRoute } from "../../utils/dashboardRoutes";
import { FaChevronRight, FaHome } from "react-icons/fa";

import "./Breadcrumb.css";

const Breadcrumb = ({ items = [] }) => {

        // Temporary role
    // Later replace with Auth Context

    const userRole = localStorage.getItem("userRole") || "Learner";

    const dashboardRoute = getDashboardRoute(userRole);

    return (

        <nav className="breadcrumb">

            <Link
                to={dashboardRoute}
                className="breadcrumb-item home"
            >
                <FaHome />
                Dashboard
            </Link>

            {items.map((item, index) => (

                <React.Fragment key={index}>

                    <FaChevronRight className="breadcrumb-separator" />

                    {

                        item.path ? (

                            <Link
                                to={item.path}
                                className="breadcrumb-item"
                            >

                                {item.label}

                            </Link>

                        ) : (

                            <span className="breadcrumb-item active">

                                {item.label}

                            </span>

                        )

                    }

                </React.Fragment>

            ))}

        </nav>

    );

};

export default Breadcrumb;