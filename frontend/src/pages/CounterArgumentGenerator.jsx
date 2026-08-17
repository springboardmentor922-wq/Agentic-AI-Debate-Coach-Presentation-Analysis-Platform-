import { useState } from "react";
import Layout from "../components/Layout";
import { generateCounterArguments } from "../services/counterService";

function CounterArgumentGenerator() {

    const [topic, setTopic] = useState("");

    const [position, setPosition] = useState("For");

    const [result, setResult] = useState([]);

    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {

        try {

            setLoading(true);

            const response =
                await generateCounterArguments(
                    topic,
                    position
                );

            setResult(response.data.counter_arguments);

        } catch (err) {

            console.log(err);

            alert("Generation Failed");

        } finally {

            setLoading(false);

        }

    };

    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>Counterargument Generator</h2>

                    <br />

                    <label>Debate Topic</label>

                    <input
                        className="form-control"
                        value={topic}
                        onChange={(e)=>setTopic(e.target.value)}
                        placeholder="Enter debate topic"
                    />

                    <br />

                    <label>Your Position</label>

                    <select
                        className="form-control"
                        value={position}
                        onChange={(e)=>setPosition(e.target.value)}
                    >
                        <option>For</option>
                        <option>Against</option>
                    </select>

                    <br />

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                    >

                        {loading
                            ? "Generating..."
                            : "Generate Counterarguments"}

                    </button>

                </div>

                {result.length > 0 && (

                    <div className="chart-card mt-4">

                        <h3>AI Generated Counterarguments</h3>

                        <ul>

                            {result.map((item,index)=>(

                                <li key={index}>{item}</li>

                            ))}

                        </ul>

                    </div>

                )}

            </div>

        </Layout>

    );

}

export default CounterArgumentGenerator;