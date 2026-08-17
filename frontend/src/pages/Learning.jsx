import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";

import { getDashboardSummary } from "../services/dashboardService";


function Learning() {

    const navigate = useNavigate();

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        loadPerformance();

    }, []);


    async function loadPerformance() {

        try {

            const data =
                await getDashboardSummary();

            setSummary(data);

        } catch (error) {

            console.error(
                "Failed to load learning recommendations:",
                error
            );

        } finally {

            setLoading(false);

        }

    }


    if (loading) {

        return (

            <Layout>

                <div className="dashboard-page">

                    <div className="chart-card">

                        <h2>Learning Center</h2>

                        <p>
                            Analyzing your performance...
                        </p>

                    </div>

                </div>

            </Layout>

        );

    }


    const skills = [

        {
            name: "Grammar",
            score: Number(summary?.average_grammar || 0),
            description:
                "Improve sentence structure, grammar accuracy and clarity while speaking.",
            action: "Practice Debate",
            path: "/topics",
        },

        {
            name: "Logic",
            score: Number(summary?.average_logic || 0),
            description:
                "Learn how to build stronger claims, connect evidence and develop logical arguments.",
            action: "Analyze Arguments",
            path: "/argument-analyzer",
        },

        {
            name: "Confidence",
            score: Number(summary?.average_confidence || 0),
            description:
                "Improve speaking confidence, reduce hesitation and communicate your ideas more clearly.",
            action: "Improve Speech",
            path: "/speech-improver",
        },

        {
            name: "Relevance",
            score: Number(summary?.average_relevance || 0),
            description:
                "Practice staying focused on the debate topic and using relevant supporting points.",
            action: "Practice Topics",
            path: "/topics",
        },

    ];


    const sortedSkills = [...skills].sort(
        (a, b) => a.score - b.score
    );


    const weakestSkill = sortedSkills[0];


    const resources = [

        {
            title: "Argument Building",
            skill: "Logic",
            description:
                "Practice constructing clear claims, supporting points and evidence.",
            path: "/argument-analyzer",
        },

        {
            title: "Logical Fallacies",
            skill: "Logic",
            description:
                "Learn to identify common reasoning mistakes and improve your arguments.",
            path: "/fallacy-detector",
        },

        {
            title: "Counterargument Practice",
            skill: "Logic",
            description:
                "Learn how to anticipate opposing views and respond with stronger reasoning.",
            path: "/counterargument-generator",
        },

        {
            title: "Rebuttal Practice",
            skill: "Confidence",
            description:
                "Practice responding to opposing arguments quickly and confidently.",
            path: "/rebuttal-generator",
        },

        {
            title: "Speech Improvement",
            skill: "Confidence",
            description:
                "Practice clearer delivery, better phrasing and confident communication.",
            path: "/speech-improver",
        },

        {
            title: "Debate Practice",
            skill: "Grammar",
            description:
                "Practice expressing your ideas clearly through real debate topics.",
            path: "/topics",
        },

        {
            title: "Relevant Evidence",
            skill: "Relevance",
            description:
                "Practice supporting your arguments with information directly related to the topic.",
            path: "/argument-analyzer",
        },

    ];


    const recommendedResources =
        resources.filter(
            (resource) =>
                resource.skill === weakestSkill.name
        );


    return (

        <Layout>

            <div className="dashboard-page">


                {/* HEADER */}

                <div className="hero-card">

                    <div>

                        <h2>
                            Learning Center
                        </h2>

                        <p>
                            Personalized learning resources based on your debate performance.
                        </p>

                    </div>

                </div>


                {/* PERFORMANCE */}

                <div className="chart-card">

                    <h3>
                        Your Skill Performance
                    </h3>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "15px",
                            marginTop: "20px",
                        }}
                    >

                        {skills.map((skill) => (

                            <div
                                key={skill.name}
                                style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    padding: "18px",
                                }}
                            >

                                <p>
                                    {skill.name}
                                </p>

                                <h3>
                                    {skill.score.toFixed(1)}/10
                                </h3>


                                <div
                                    style={{
                                        height: "8px",
                                        background: "#e5e7eb",
                                        borderRadius: "10px",
                                        marginTop: "10px",
                                        overflow: "hidden",
                                    }}
                                >

                                    <div
                                        style={{
                                            width: `${Math.min(
                                                skill.score * 10,
                                                100
                                            )}%`,
                                            height: "100%",
                                            background: "#4F46E5",
                                        }}
                                    />

                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* RECOMMENDED */}

                <div
                    className="chart-card"
                    style={{
                        marginTop: "25px",
                    }}
                >

                    <h3>
                        Recommended For You
                    </h3>

                    <p>
                        Your current focus area is{" "}
                        <strong>
                            {weakestSkill.name}
                        </strong>{" "}
                        with a score of{" "}
                        <strong>
                            {weakestSkill.score.toFixed(1)}/10
                        </strong>.
                    </p>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >

                        {recommendedResources.map(
                            (resource, index) => (

                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "20px",
                                    }}
                                >

                                    <h4>
                                        {resource.title}
                                    </h4>

                                    <p
                                        style={{
                                            marginTop: "10px",
                                            minHeight: "65px",
                                        }}
                                    >
                                        {resource.description}
                                    </p>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            navigate(
                                                resource.path
                                            )
                                        }
                                    >
                                        Start Practice
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>


                {/* ALL RESOURCES */}

                <div
                    className="chart-card"
                    style={{
                        marginTop: "25px",
                    }}
                >

                    <h3>
                        All Learning Resources
                    </h3>


                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >

                        {resources.map(
                            (resource, index) => (

                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "20px",
                                    }}
                                >

                                    <small>
                                        {resource.skill}
                                    </small>

                                    <h4
                                        style={{
                                            marginTop: "8px",
                                        }}
                                    >
                                        {resource.title}
                                    </h4>

                                    <p>
                                        {resource.description}
                                    </p>

                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() =>
                                            navigate(
                                                resource.path
                                            )
                                        }
                                    >
                                        Open Resource
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>


            </div>

        </Layout>

    );

}


export default Learning;