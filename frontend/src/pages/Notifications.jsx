import { useState } from "react";
import AppShell from "../layouts/AppShell";

function Notifications() {

    const [notifications] = useState([

        {
            id: 1,
            type: "Debate",
            title: "Upcoming Debate Session",
            message: "Your AI Debate Simulation starts tomorrow at 4:00 PM.",
            time: "2 hours ago",
            unread: true
        },

        {
            id: 2,
            type: "Feedback",
            title: "AI Feedback Ready",
            message: "Your latest debate analysis has been generated.",
            time: "Yesterday",
            unread: true
        },

        {
            id: 3,
            type: "Recommendation",
            title: "New Learning Resource",
            message: "Counterargument Strategies has been recommended.",
            time: "2 days ago",
            unread: false
        },

        {
            id: 4,
            type: "Achievement",
            title: "Skill Improved",
            message: "Logical Consistency increased by 8%.",
            time: "4 days ago",
            unread: false
        }

    ]);

    return (

        <AppShell>

            <div className="page-header">

                <div>

                    <h1>🔔 Notifications</h1>

                    <p>

                        Stay updated with debates, AI feedback,
                        achievements and reminders.

                    </p>

                </div>

            </div>

            <div
                style={{
                    marginTop: "30px",
                    display: "grid",
                    gap: "20px"
                }}
            >

                {

                    notifications.map(notification => (

                        <div
                            className="panel"
                            key={notification.id}
                            style={{
                                borderLeft:
                                    notification.unread
                                        ? "5px solid #8b5cf6"
                                        : "5px solid transparent"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >

                                <div>

                                    <span
                                        style={{
                                            color: "#a78bfa",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >

                                        {notification.type}

                                    </span>

                                    <h2
                                        style={{
                                            marginTop: "6px"
                                        }}
                                    >

                                        {notification.title}

                                    </h2>

                                    <p
                                        style={{
                                            color: "#9ca3af"
                                        }}
                                    >

                                        {notification.message}

                                    </p>

                                </div>

                                <small
                                    style={{
                                        color: "#64748b"
                                    }}
                                >

                                    {notification.time}

                                </small>

                            </div>

                        </div>

                    ))

                }

            </div>

        </AppShell>

    );

}

export default Notifications;