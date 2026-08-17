import { useState } from "react";
import Layout from "../components/Layout";
import { improveSpeech } from "../services/speechService";

function SpeechImprover() {

    const [speech, setSpeech] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleImprove = async () => {

        try {

            setLoading(true);

            const response = await improveSpeech(speech);

            setResult(response.data);

        }

        catch (err) {

            console.log(err);

            alert("Speech Improvement Failed");

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>AI Speech Improver</h2>

                    <br />

                    <textarea
                        className="form-control"
                        rows="10"
                        placeholder="Paste your speech..."
                        value={speech}
                        onChange={(e)=>setSpeech(e.target.value)}
                    />

                    <br />

                    <button
                        className="btn btn-primary"
                        onClick={handleImprove}
                    >

                        {loading ? "Improving..." : "Improve Speech"}

                    </button>

                </div>

                {result && (

                    <>

                        <div className="chart-card mt-4">

                            <h3>Improved Speech</h3>

                            <p style={{whiteSpace:"pre-wrap"}}>

                                {result.improved_speech}

                            </p>

                        </div>

                        <div className="dashboard-grid">

                            <div className="chart-card">

                                <h3>Better Opening</h3>

                                <p>{result.opening}</p>

                            </div>

                            <div className="chart-card">

                                <h3>Better Closing</h3>

                                <p>{result.closing}</p>

                            </div>

                        </div>

                        <div className="dashboard-grid">

                            <div className="chart-card">

                                <h3>Vocabulary Suggestions</h3>

                                <ul>

                                    {result.vocabulary.map((word,index)=>(

                                        <li key={index}>{word}</li>

                                    ))}

                                </ul>

                            </div>

                            <div className="chart-card">

                                <h3>Speaking Tips</h3>

                                <ul>

                                    {result.tips.map((tip,index)=>(

                                        <li key={index}>{tip}</li>

                                    ))}

                                </ul>

                            </div>

                        </div>

                    </>

                )}

            </div>

        </Layout>

    );

}

export default SpeechImprover;