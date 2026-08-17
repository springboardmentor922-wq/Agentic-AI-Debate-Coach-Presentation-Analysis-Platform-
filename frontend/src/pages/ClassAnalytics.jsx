import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
    getEducatorClasses,
    getClassAnalytics
} from "../services/educatorClassService";

function ClassAnalytics() {
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [data, setData] = useState(null);

    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            setLoadingClasses(true);
            setError("");

            const result = await getEducatorClasses();

            setClasses(Array.isArray(result) ? result : []);

            if (result && result.length > 0) {
                setSelectedClass(String(result[0].id));
            }
        } catch (err) {
            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to load classes."
            );
        } finally {
            setLoadingClasses(false);
        }
    };

    useEffect(() => {
        if (selectedClass) {
            loadAnalytics(selectedClass);
        }
    }, [selectedClass]);

    const loadAnalytics = async (classId) => {
        try {
            setLoadingAnalytics(true);
            setError("");

            const result = await getClassAnalytics(classId);

            setData(result);
        } catch (err) {
            console.error(err);

            setData(null);

            setError(
                err?.response?.data?.detail ||
                "Unable to load class analytics."
            );
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const getValue = (...values) => {
        for (const value of values) {
            if (
                value !== undefined &&
                value !== null
            ) {
                return value;
            }
        }

        return 0;
    };

    const averageScore = Number(
        getValue(
            data?.average_score,
            data?.average_class_score,
            data?.performance?.average_score
        )
    );

    const highestScore = Number(
        getValue(
            data?.highest_score,
            data?.performance?.highest_score
        )
    );

    const lowestScore = Number(
        getValue(
            data?.lowest_score,
            data?.performance?.lowest_score
        )
    );

    const evaluatedDebates = Number(
        getValue(
            data?.evaluated_debates,
            data?.total_debates,
            data?.performance?.total_debates,
            data?.evaluation_count
        )
    );

    const totalLearners = Number(
        getValue(
            data?.student_count,
            data?.total_learners,
            data?.learners_count
        )
    );

    const skills = data?.skills || {};

    const grammar = Number(
        getValue(
            skills.grammar,
            data?.grammar,
            data?.grammar_average
        )
    );

    const logic = Number(
        getValue(
            skills.logic,
            data?.logic,
            data?.logic_average
        )
    );

    const confidence = Number(
        getValue(
            skills.confidence,
            data?.confidence,
            data?.confidence_average
        )
    );

    const relevance = Number(
        getValue(
            skills.relevance,
            data?.relevance,
            data?.relevance_average
        )
    );

    const topPerformer =
        data?.top_performer ||
        data?.top_student ||
        data?.performance?.top_performer ||
        null;

    const topName =
        typeof topPerformer === "string"
            ? topPerformer
            : topPerformer?.name ||
              topPerformer?.full_name ||
              "No data";

    const topScore = Number(
        typeof topPerformer === "object"
            ? getValue(
                  topPerformer?.score,
                  topPerformer?.average_score
              )
            : getValue(
                  data?.top_performer_score,
                  data?.top_score
              )
    );

    const MetricCard = ({
        title,
        value
    }) => (
        <div
            style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "25px",
                border: "1px solid #e5e7eb",
                boxShadow:
                    "0 4px 15px rgba(0,0,0,0.05)"
            }}
        >
            <p
                style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "15px"
                }}
            >
                {title}
            </p>

            <h2
                style={{
                    marginTop: "12px",
                    marginBottom: 0,
                    fontSize: "32px",
                    color: "#111827"
                }}
            >
                {value}
            </h2>
        </div>
    );

    const SkillBar = ({
        name,
        value
    }) => (
        <div
            style={{
                marginBottom: "25px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px"
                }}
            >
                <strong>{name}</strong>

                <strong
                    style={{
                        color: "#5b2be0"
                    }}
                >
                    {Number(value).toFixed(2)}%
                </strong>
            </div>

            <div
                style={{
                    width: "100%",
                    height: "11px",
                    background: "#e5e7eb",
                    borderRadius: "20px",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        width: `${Math.min(
                            Math.max(Number(value), 0),
                            100
                        )}%`,
                        height: "100%",
                        background: "#5b2be0",
                        borderRadius: "20px"
                    }}
                />
            </div>
        </div>
    );

    if (loadingClasses) {
        return (
            <Layout>
                <div style={{ padding: "40px" }}>
                    <h2>
                        Loading classes...
                    </h2>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div
                style={{
                    padding: "32px",
                    maxWidth: "1400px",
                    margin: "0 auto"
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                        flexWrap: "wrap",
                        gap: "15px"
                    }}
                >
                    <div>
                        <h1
                            style={{
                                marginBottom: "8px"
                            }}
                        >
                            Class Analytics
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                margin: 0
                            }}
                        >
                            Analyze learner performance
                            and identify skill gaps.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/educator/classes"
                            )
                        }
                        style={{
                            border: "none",
                            background: "#5b2be0",
                            color: "white",
                            padding:
                                "12px 20px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        Manage Classes
                    </button>
                </div>

                {/* CLASS SELECT */}

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        padding: "20px",
                        marginBottom: "25px",
                        border:
                            "1px solid #e5e7eb"
                    }}
                >
                    <label
                        style={{
                            display: "block",
                            fontWeight: "600",
                            marginBottom: "10px"
                        }}
                    >
                        Select Class
                    </label>

                    <select
                        value={selectedClass}
                        onChange={(e) =>
                            setSelectedClass(
                                e.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            maxWidth: "450px",
                            padding: "12px",
                            borderRadius: "10px",
                            border:
                                "1px solid #d1d5db",
                            fontSize: "15px"
                        }}
                    >
                        {classes.length === 0 && (
                            <option value="">
                                No classes available
                            </option>
                        )}

                        {classes.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ERROR */}

                {error && (
                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            padding: "18px",
                            borderRadius: "12px",
                            marginBottom: "25px"
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* LOADING */}

                {loadingAnalytics && (
                    <div
                        style={{
                            background: "#ffffff",
                            padding: "30px",
                            borderRadius: "16px",
                            marginBottom: "25px"
                        }}
                    >
                        <h3>
                            Loading analytics...
                        </h3>
                    </div>
                )}

                {/* ANALYTICS */}

                {!loadingAnalytics && data && (
                    <>
                        {/* SUMMARY CARDS */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "20px",
                                marginBottom: "30px"
                            }}
                        >
                            <MetricCard
                                title="Total Learners"
                                value={
                                    totalLearners
                                }
                            />

                            <MetricCard
                                title="Average Score"
                                value={`${averageScore.toFixed(
                                    2
                                )}%`}
                            />

                            <MetricCard
                                title="Highest Score"
                                value={`${highestScore.toFixed(
                                    2
                                )}%`}
                            />

                            <MetricCard
                                title="Lowest Score"
                                value={`${lowestScore.toFixed(
                                    2
                                )}%`}
                            />

                            <MetricCard
                                title="Evaluated Debates"
                                value={
                                    evaluatedDebates
                                }
                            />
                        </div>

                        {/* TOP PERFORMER */}

                        <div
                            style={{
                                background:
                                    "#ffffff",
                                borderRadius:
                                    "16px",
                                padding: "25px",
                                marginBottom:
                                    "30px",
                                border:
                                    "1px solid #e5e7eb"
                            }}
                        >
                            <h2>
                                🏆 Top Performer
                            </h2>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    flexWrap:
                                        "wrap",
                                    gap: "15px"
                                }}
                            >
                                <div>
                                    <h2
                                        style={{
                                            marginBottom:
                                                "5px"
                                        }}
                                    >
                                        {topName}
                                    </h2>

                                    <p
                                        style={{
                                            color:
                                                "#64748b"
                                        }}
                                    >
                                        Highest
                                        average
                                        performance
                                        in this
                                        class.
                                    </p>
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            "32px",
                                        fontWeight:
                                            "700",
                                        color:
                                            "#5b2be0"
                                    }}
                                >
                                    {topScore.toFixed(
                                        2
                                    )}
                                    %
                                </div>
                            </div>
                        </div>

                        {/* SKILL PERFORMANCE */}

                        <div
                            style={{
                                background:
                                    "#ffffff",
                                borderRadius:
                                    "16px",
                                padding: "30px",
                                marginBottom:
                                    "30px",
                                border:
                                    "1px solid #e5e7eb"
                            }}
                        >
                            <h2>
                                Skill Performance
                            </h2>

                            <p
                                style={{
                                    color:
                                        "#64748b",
                                    marginBottom:
                                        "30px"
                                }}
                            >
                                Average performance
                                across learner
                                evaluations.
                            </p>

                            <SkillBar
                                name="Grammar"
                                value={grammar}
                            />

                            <SkillBar
                                name="Logic"
                                value={logic}
                            />

                            <SkillBar
                                name="Confidence"
                                value={confidence}
                            />

                            <SkillBar
                                name="Relevance"
                                value={relevance}
                            />
                        </div>

                        {/* INSIGHTS */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "20px"
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "#ffffff",
                                    borderRadius:
                                        "16px",
                                    padding:
                                        "25px",
                                    border:
                                        "1px solid #e5e7eb"
                                }}
                            >
                                <h2>
                                    📊 Performance
                                    Summary
                                </h2>

                                <p>
                                    The class has{" "}
                                    <strong>
                                        {
                                            totalLearners
                                        }
                                    </strong>{" "}
                                    learners with
                                    an average
                                    performance of{" "}
                                    <strong>
                                        {averageScore.toFixed(
                                            2
                                        )}
                                        %
                                    </strong>
                                    .
                                </p>
                            </div>

                            <div
                                style={{
                                    background:
                                        "#ffffff",
                                    borderRadius:
                                        "16px",
                                    padding:
                                        "25px",
                                    border:
                                        "1px solid #e5e7eb"
                                }}
                            >
                                <h2>
                                    🎯 Improvement
                                    Focus
                                </h2>

                                <p>
                                    Focus on the
                                    weakest skill
                                    area to improve
                                    overall class
                                    performance.
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {!loadingAnalytics &&
                    !data &&
                    !error &&
                    classes.length === 0 && (
                        <div
                            style={{
                                background:
                                    "#ffffff",
                                padding: "40px",
                                borderRadius:
                                    "16px",
                                textAlign: "center"
                            }}
                        >
                            <h2>
                                No classes found
                            </h2>

                            <p>
                                Create a class first
                                to view analytics.
                            </p>
                        </div>
                    )}
            </div>
        </Layout>
    );
}

export default ClassAnalytics;