import { useState } from "react";
import Layout from "../components/Layout";
import { analyzeArgument } from "../services/argumentService";

function ArgumentAnalyzer() {

    const [argument, setArgument] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {

        try {

            setLoading(true);

            const response = await analyzeArgument(argument);

            setResult(response.data);

        }

        catch (err) {

            alert("Analysis Failed");

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Layout>

            <div className="dashboard-page">

                <h1>AI Argument Analyzer</h1>

                <textarea
                    className="form-control"
                    rows="10"
                    value={argument}
                    onChange={(e)=>setArgument(e.target.value)}
                    placeholder="Paste your argument..."
                />

                <button
                    className="btn btn-primary mt-3"
                    onClick={handleAnalyze}
                >

                    {loading ? "Analyzing..." : "Analyze"}

                </button>

                {result && (

                    <div className="chart-card mt-4">

                        <h3>Main Claim</h3>

                        <p>{result.claim}</p>

                        <hr/>

                        <h3>Supporting Points</h3>

                        <ul>

                            {result.supporting_points.map((item,index)=>(

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                        <hr/>

                        <h3>Strengths</h3>

                        <ul>

                            {result.strengths.map((item,index)=>(

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                        <hr/>

                        <h3>Weaknesses</h3>

                        <ul>

                            {result.weaknesses.map((item,index)=>(

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                        <hr/>

                        <h3>Suggestions</h3>

                        <ul>

                            {result.suggestions.map((item,index)=>(

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                    </div>

                )}

            </div>

        </Layout>

    );

}

export default ArgumentAnalyzer;