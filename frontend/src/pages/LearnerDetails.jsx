import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CoachLayout from "../components/coach/CoachLayout";
import { getLearnerDetail } from "../services/coachDashboardService";
import { submitCoachReview } from "../services/coachReviewService";
function LearnerDetails() {

    const { id } = useParams();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);
    
    const [review, setReview] = useState({

    grammar: "",

    logic: "",

    confidence: "",

    communication: "",

    overall: "",

    strengths: "",

    improvements: "",

    feedback: "",

});

    useEffect(() => {

        loadData();

    }, []);

    async function loadData() {

        try {

            const response =
                await getLearnerDetail(id);

            setData(response);
            console.log(response);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (

            <CoachLayout>

                <h2>Loading...</h2>

            </CoachLayout>

        );

    }

    function handleChange(e) {

    setReview({

        ...review,

        [e.target.name]: e.target.value,

    });

}

async function submitReview() {

    try {
        console.log("SESSION ID:", data.session.id);

console.log("REVIEW OBJECT:");

console.log(review);

        await submitCoachReview(

            data.session.id,

            review

        );

        alert("Review Submitted Successfully");

        loadData();

    }

    catch (err) {

        console.log(err);

        alert("Failed to Submit Review");

    }

}




    return (

        <CoachLayout>

            <div className="coach-main">

                <h1>Learner Details</h1>

                <br />

                <div className="chart-card">

                    <h2>👤 Learner Information</h2>

                    <hr />

                    <p>

                        <strong>Name :</strong>

                        {data.learner.name}

                    </p>

                    <p>

                        <strong>Email :</strong>

                        {data.learner.email}

                    </p>

                    <p>

                        <strong>Role :</strong>

                        {data.learner.role}

                    </p>

                </div>

                <br />

                <div className="chart-card">

                    <h2>📚 Latest Debate</h2>

                    <hr />

                    <p>

                        <strong>Topic :</strong>

                        {data.evaluation?.topic}

                    </p>

                    <p>

                        <strong>Overall Score :</strong>

                        {data.evaluation?.overall_score}

                    </p>

                    <p>

                        <strong>Grade :</strong>

                        {data.evaluation?.grade}

                    </p>

                </div>

                <br />

                <div className="chart-card">

                    <h2>🎤 Recording</h2>

                    <hr />

                    {data.evaluation?.recording ? (

                        <audio
                            controls
                            style={{ width: "100%" }}
                        >

                            <source
                                src={`http://127.0.0.1:8000/${data.evaluation.recording}`}
                                type="audio/webm"
                            />
                            Your browser does not support audio.
                        </audio>

                    ) : (

                        <p>No recording available.</p>

                    )}

                </div>

                <br />

                <div className="chart-card">

                    <h2>📝 Debate Transcript</h2>

                    <hr />

                    <p>

                        {data.evaluation?.argument}

                    </p>

                </div>


                <br />

<div className="chart-card">

    <h2>🤖 AI Evaluation</h2>

    <hr />

    <p>

        <strong>Overall Score :</strong>

        {data.evaluation?.overall_score}

    </p>

    <p>

        <strong>Grade :</strong>

        {data.evaluation?.grade}

    </p>

    <br />

    <h3>AI Feedback</h3>

    <p>

        {data.evaluation?.feedback}

    </p>

</div>

<br />

<div className="chart-card">

    <h2>⭐ Strengths</h2>

    <hr />

    <ul>

        {data.evaluation?.strengths?.map((item,index)=>(

            <li key={index}>

                {item}

            </li>

        ))}

    </ul>

</div>

<br />

<div className="chart-card">

    <h2>⚠ Areas for Improvement</h2>

    <hr />

    <ul>

        {data.evaluation?.weaknesses?.map((item,index)=>(

            <li key={index}>

                {item}

            </li>

        ))}

    </ul>

</div>

<br />

<div className="chart-card">

    <h2>🎯 AI Coach Tips</h2>

    <hr />

    <ul>

        {data.evaluation?.coach_tips?.map((item,index)=>(

            <li key={index}>

                {item}

            </li>

        ))}

    </ul>

</div>


<br />

<div className="chart-card">

    <h2>⚠ Logical Fallacies</h2>

    <hr />

    {data.evaluation?.logical_fallacies?.length === 0 ? (

        <p>No fallacies detected.</p>

    ) : (

        data.evaluation.logical_fallacies.map((item,index)=>(

            <div
                key={index}
                style={{
                    background:"#fff",
                    border:"1px solid #ddd",
                    borderRadius:"10px",
                    padding:"15px",
                    marginBottom:"15px"
                }}
            >

                <h4>
                    {item.fallacy}
                </h4>

                <strong>Description</strong>

                <p>
                    {item.description}
                </p>

                <strong>How to Fix</strong>

                <p>
                    {item.how_to_fix}
                </p>

            </div>

        ))

    )}

</div>


<br />

<div className="chart-card">

    <h2>💬 Counter Arguments</h2>

    <hr />

    {data.evaluation?.counter_arguments?.map((item,index)=>(

        <div
            key={index}
            style={{
                background:"#EEF4FF",
                borderRadius:"10px",
                padding:"15px",
                marginBottom:"15px"
            }}
        >

            <h4>

                {item.title}

            </h4>

            <p>

                {item.argument}

            </p>

        </div>

    ))}

</div>

<br />

<div className="chart-card">

<h2>🛡 AI Rebuttals</h2>

<hr />

{data.evaluation?.rebuttals?.map((item,index)=>(

<div
key={index}
style={{
background:"#F3F4F6",
padding:"15px",
borderRadius:"10px",
marginBottom:"15px"
}}
>

<strong>

Rebuttal {index+1}

</strong>

<p>

{item}

</p>

</div>

))}

</div>

     <br />

<div className="chart-card">

<h2>✨ Improved Argument</h2>

<hr />

<p>

{data.evaluation?.improved_argument}

</p>

</div>


<br />

<div className="chart-card">

<h2>🎤 Opening Statement</h2>

<hr />

<p>

{data.evaluation?.opening_statement}

</p>

</div>

<br />

<div className="chart-card">

<h2>🏁 Closing Statement</h2>

<hr />

<p>

{data.evaluation?.closing_statement}

</p>

</div>


      <br />

<div className="chart-card">

    <h2>⭐ Coach Review</h2>

    <hr />

    <div className="dashboard-grid">

        <div>

            <label>Grammar</label>

            <input
                className="form-control"
                type="number"
                name="grammar"
                min="1"
                max="10"
                value={review.grammar}
                onChange={handleChange}
            />

            <br />

            <label>Logic</label>

            <input
                className="form-control"
                type="number"
                name="logic"
                min="1"
                max="10"
                value={review.logic}
                onChange={handleChange}
            />

            <br />

            <label>Confidence</label>

            <input
                className="form-control"
                type="number"
                name="confidence"
                min="1"
                max="10"
                value={review.confidence}
                onChange={handleChange}
            />

            <br />

            <label>Communication</label>

            <input
                className="form-control"
                type="number"
                name="communication"
                min="1"
                max="10"
                value={review.communication}
                onChange={handleChange}
            />

            <br />

            <label>Overall</label>

            <input
                className="form-control"
                type="number"
                name="overall"
                min="1"
                max="10"
                value={review.overall}
                onChange={handleChange}
            />

        </div>

        <div>

            <label>Strengths</label>

            <textarea
                className="form-control"
                rows="3"
                name="strengths"
                value={review.strengths}
                onChange={handleChange}
            />

            <br />

            <label>Areas for Improvement</label>

            <textarea
                className="form-control"
                rows="3"
                name="improvements"
                value={review.improvements}
                onChange={handleChange}
            />

            <br />

            <label>Detailed Feedback</label>

            <textarea
                className="form-control"
                rows="5"
                name="feedback"
                value={review.feedback}
                onChange={handleChange}
            />

        </div>

    </div>

    <br />

    <button

        className="btn btn-primary"

        onClick={submitReview}

    >

        Submit Review

    </button>

</div>

            </div>

        </CoachLayout>

    );

}



export default LearnerDetails;