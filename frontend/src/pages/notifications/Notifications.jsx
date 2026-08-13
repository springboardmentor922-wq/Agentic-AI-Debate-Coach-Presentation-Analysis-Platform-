import { useEffect, useMemo, useState } from "react";
import { FaBell, FaCheckDouble, FaTrash, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/notificationService";
import { useToast } from "../../context/ToastContext";
import { formatDateTime, toArray } from "../../utils/learnerHelpers";

const Notifications = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        let active = true;

        const loadNotifications = async () => {
            try {
                setLoading(true);
                const notificationData = await getNotifications();
                if (!active) return;
                setNotifications(toArray(notificationData).map((n) => ({
                    ...n,
                    read: Boolean(n.is_read || n.read)
                })));
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) {
                    setError("Unable to load notifications.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadNotifications();
        return () => { active = false; };
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            if (typeFilter === "all") return true;
            return (n.type || n.notification_type || "").toLowerCase().includes(typeFilter.toLowerCase());
        });
    }, [notifications, typeFilter]);

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((current) => current.map((n) => ({ ...n, read: true })));
            showToast("All notifications marked as read.", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to mark notifications as read.", "error");
        }
    };

    const handleClearAll = () => {
        setNotifications([]);
        showToast("Cleared all notifications.", "info");
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (notification.id && typeof notification.id === "number") {
                await markNotificationRead(notification.id);
            }
        } catch (err) {
            console.warn(err);
        }

        setNotifications((current) =>
            current.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );

        const type = (notification.type || notification.notification_type || "").toLowerCase();
        if (type.includes("session") || type.includes("practice") || type.includes("assignment")) {
            navigate("/debate-sessions");
        } else if (type.includes("report") || type.includes("evaluation") || type.includes("feedback")) {
            navigate("/reports");
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="notifications-page"><div className="empty-state">Loading notifications...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="notifications-page">
                <Breadcrumb items={[{ label: "Dashboard", path: "/learner/dashboard" }, { label: "Notifications" }]} />

                <div className="notifications-header">
                    <div>
                        <h1>Notifications</h1>
                        <p>Real-time updates from sessions, reports, and learning activity.</p>
                    </div>
                    <div className="notifications-icon"><FaBell /></div>
                </div>

                {error && <div className="empty-state">{error}</div>}

                <div className="notifications-toolbar">
                    <div className="filter-buttons">
                        <button type="button" className={`filter-btn ${typeFilter === "all" ? "active" : ""}`} onClick={() => setTypeFilter("all")}>
                            All ({notifications.length})
                        </button>
                        <button type="button" className={`filter-btn ${typeFilter === "session" ? "active" : ""}`} onClick={() => setTypeFilter("session")}>
                            Sessions
                        </button>
                        <button type="button" className={`filter-btn ${typeFilter === "report" ? "active" : ""}`} onClick={() => setTypeFilter("report")}>
                            Reports
                        </button>
                    </div>

                    <div className="action-buttons">
                        <button type="button" className="btn-secondary-sm" onClick={handleMarkAllRead} disabled={notifications.length === 0}>
                            <FaCheckDouble /> Mark all read
                        </button>
                        <button type="button" className="btn-secondary-sm danger" onClick={handleClearAll} disabled={notifications.length === 0}>
                            <FaTrash /> Clear all
                        </button>
                    </div>
                </div>

                <div className="notifications-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="empty-state">No notifications available right now.</div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <article
                                key={notification.id}
                                className={`notification-card ${notification.read ? "read" : "unread"}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div>
                                    <span className={`notification-type ${notification.type}`}>{notification.type}</span>
                                    <h3>{notification.title}</h3>
                                    <p>{notification.message}</p>
                                </div>
                                <small>{formatDateTime(notification.created_at)}</small>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Notifications;
