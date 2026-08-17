import { useState } from "react";
import Layout from "../components/Layout";
import { detectFallacies } from "../services/fallacyService";
import FallacyCard from "../components/ai/FallacyCard";
function FallacyDetector() {

    const [argument, setArgument] = useState("");

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleDetect = async () => {

        try {

            setLoading(true);

            const response = await detectFallacies(argument);

            setResult(response.data);

        }

        catch (err) {

            alert("Detection Failed");

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <Layout>

            <div className="dashboard-page">

                <div className="chart-card">

                    <h2>Fallacy Detector</h2>

                    <br />

                    <textarea
                        className="form-control"
                        rows="8"
                        placeholder="Paste your argument..."
                        value={argument}
                        onChange={(e)=>setArgument(e.target.value)}
                    />

                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleDetect}
                    >
                        {loading ? "Detecting..." : "Detect Fallacies"}
                    </button>

                </div>

                {result && (

                    <div className="chart-card mt-4">

                        <h3>Detected Fallacies</h3>

<div>

{result.detected_fallacies.map((item,index)=>(

<FallacyCard
    key={index}
    fallacy={{
        fallacy: item,
        description: result.explanation[index],
        how_to_fix: result.suggestions[index]
    }}
/>

))}

</div>

                        

                        

                    </div>

                )}

            </div>

        </Layout>

    );

}

export default FallacyDetector;