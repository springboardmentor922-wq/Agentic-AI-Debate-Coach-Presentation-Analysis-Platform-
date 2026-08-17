import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import {
    getLearnerAnnouncements
} from "../services/announcementService";


function Announcements() {

    const [announcements, setAnnouncements] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        loadAnnouncements();

    }, []);


    const loadAnnouncements = async () => {

        try {

            const data =
                await getLearnerAnnouncements();

            setAnnouncements(
                data || []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

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
                        Loading announcements...
                    </h2>

                </div>

            </Layout>

        );

    }


    return (

        <Layout>

            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "30px"
                }}
            >

                <h1>
                    Announcements
                </h1>

                <p
                    style={{
                        color: "#64748b"
                    }}
                >
                    Important updates from your
                    educators.
                </p>


                {announcements.length === 0 ? (

                    <div
                        style={{
                            background: "white",
                            padding: "50px",
                            borderRadius: "16px",
                            textAlign: "center",
                            marginTop: "25px"
                        }}
                    >

                        <h2>
                            No announcements
                        </h2>

                        <p>
                            You don't have any
                            announcements yet.
                        </p>

                    </div>

                ) : (

                    <div
                        style={{
                            display: "grid",
                            gap: "18px",
                            marginTop: "25px"
                        }}
                    >

                        {announcements.map(
                            announcement => (

                                <div
                                    key={
                                        announcement.id
                                    }
                                    style={{
                                        background:
                                            "white",
                                        padding:
                                            "24px",
                                        borderRadius:
                                            "16px",
                                        border:
                                            "1px solid #e2e8f0",
                                        borderLeft:
                                            announcement.priority ===
                                            "Urgent"
                                                ? "5px solid #dc2626"
                                                : announcement.priority ===
                                                  "Important"
                                                    ? "5px solid #f59e0b"
                                                    : "5px solid #5b21b6"
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center"
                                        }}
                                    >

                                        <h2>
                                            {
                                                announcement.title
                                            }
                                        </h2>

                                        <span
                                            style={{
                                                fontWeight:
                                                    "600"
                                            }}
                                        >
                                            {
                                                announcement.priority
                                            }
                                        </span>

                                    </div>


                                    <p
                                        style={{
                                            whiteSpace:
                                                "pre-wrap",
                                            lineHeight:
                                                "1.7"
                                        }}
                                    >
                                        {
                                            announcement.message
                                        }
                                    </p>


                                    <small
                                        style={{
                                            color:
                                                "#64748b"
                                        }}
                                    >

                                        {new Date(
                                            announcement.created_at
                                        ).toLocaleString()}

                                    </small>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </Layout>

    );

}


export default Announcements;