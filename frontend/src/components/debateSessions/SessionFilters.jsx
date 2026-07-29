/*
=========================================================
Session Filters Component
=========================================================
*/

import React from "react";
import {
    FaSearch,
    FaFilter,
    FaTimes,
} from "react-icons/fa";

import "./SessionFilters.css";

const SessionFilters = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    formatFilter,
    setFormatFilter,
    dateFilter,
    setDateFilter,
}) => {

    const handleClear = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setFormatFilter("ALL");
        setDateFilter("");
    };

    return (

        <div className="session-filters">

            {/* Search */}

            <div className="filter-search">

                <FaSearch />

                <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                />

            </div>

            {/* Filters */}

            <div className="filter-group">

                <FaFilter className="filter-icon" />

                {/* Status */}

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="Scheduled">
                        Scheduled
                    </option>

                    <option value="Completed">
                        Completed
                    </option>

                    <option value="Live">
                        Live
                    </option>

                    <option value="Cancelled">
                        Cancelled
                    </option>

                </select>

                {/* Debate Format */}

                <select
                    value={formatFilter}
                    onChange={(e) =>
                        setFormatFilter(e.target.value)
                    }
                >

                    <option value="ALL">
                        All Formats
                    </option>

                    <option value="Oxford Debate">
                        Oxford Debate
                    </option>

                    <option value="Public Forum">
                        Public Forum
                    </option>

                    <option value="Lincoln-Douglas">
                        Lincoln-Douglas
                    </option>

                    <option value="Parliamentary">
                        Parliamentary
                    </option>

                    <option value="One-on-One">
                        One-on-One
                    </option>

                    <option value="Team Debate">
                        Team Debate
                    </option>

                </select>

                {/* Date */}

                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) =>
                        setDateFilter(e.target.value)
                    }
                />

                {/* Clear */}

                <button
                    className="clear-filter-btn"
                    onClick={handleClear}
                >

                    <FaTimes />

                    Clear

                </button>

            </div>

        </div>

    );

};

export default SessionFilters;