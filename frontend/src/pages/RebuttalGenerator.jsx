import { useState } from "react";
import Layout from "../components/Layout";
import { generateRebuttal } from "../services/rebuttalService";

function RebuttalGenerator() {

    const [argument, setArgument] = useState("");

    const [result, setResult] = useState("");

    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {

        try {

            setLoading(true);

            const response = await generateRebuttal(argument);

            setResult(response.data.rebuttal);

        }

        catch (err) {

            console.log(err);

            alert("Generation Failed");

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>AI Rebuttal Generator</h2>

                    <br />

                    <textarea
                        className="form-control"
                        rows="8"
                        placeholder="Paste your opponent's argument..."
                        value={argument}
                        onChange={(e)=>setArgument(e.target.value)}
                    />

                    <br />

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                    >

                        {loading
                            ? "Generating..."
                            : "Generate Rebuttal"}

                    </button>

                </div>

                {result && (

                    <div className="chart-card mt-4">

                        <h3>Suggested Rebuttal</h3>

                        <p
                            style={{
                                whiteSpace:"pre-wrap",
                                lineHeight:1.8
                            }}
                        >

                            {result}

                        </p>

                    </div>

                )}

            </div>

        </Layout>

    );

}

export default RebuttalGenerator;