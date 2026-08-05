import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { getNotifications } from "../../services/notificationService";
import { formatDateTime, toArray } from "../../utils/learnerHelpers";

import "./Notifications.css";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadNotifications = async () => {
            try {
                setLoading(true);
                const notificationData = await getNotifications();
                if (!active) return;
                setNotifications(toArray(notificationData));
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

                <div className="notifications-list">
                    {notifications.length === 0 ? (
                        <div className="empty-state">No notifications available yet.</div>
                    ) : notifications.map((notification) => (
                        <article key={notification.id} className="notification-card">
                            <div>
                                <span className="notification-type">{notification.type}</span>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                            </div>
                            <small>{formatDateTime(notification.created_at)}</small>
                        </article>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default Notifications;
