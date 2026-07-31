const API_URL = "http://127.0.0.1:8000";

/* =========================
   PROFILE
========================= */

document.getElementById("coachName").innerText =
localStorage.getItem("fullname") || "Coach";

document.getElementById("coachRole").innerText =
localStorage.getItem("role") || "Debate Coach";

showDashboard();

/* =========================
   HIDE SECTIONS
========================= */

function hideSections(){

    document.getElementById(
        "dashboardSection"
    ).style.display = "none";

    document.getElementById(
        "debatesSection"
    ).style.display = "none";

    document.getElementById(
        "reviewSection"
    ).style.display = "none";
}

/* =========================
   DASHBOARD
========================= */

function showDashboard(){

    hideSections();

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";
    document.querySelector(".cards").style.display = "grid";

    document.querySelector(".cards")
    .style.display = "grid";

    document.getElementById(
        "dashboardResultSection"
    ).style.display = "none";

    document.getElementById(
        "dashboardResultSection"
    ).innerHTML = "";

    loadStats();
}
/* =========================
   LOGOUT
========================= */

function logout(){

    localStorage.clear();

    window.location.href =
    "login.html";
}

/* =========================
   STATS
========================= */

async function loadStats(){

    const learnersResponse =
    await fetch(
        `${API_URL}/users/role/Learner`
    );

    const learners =
    await learnersResponse.json();

    document.getElementById(
        "totalLearners"
    ).innerText =
    learners.length;

    const pendingResponse =
    await fetch(
        `${API_URL}/coach/debates`
    );

    const pendingDebates =
    await pendingResponse.json();

    document.getElementById(
        "pendingReviews"
    ).innerText =
    pendingDebates.length;

    const reviewedResponse =
    await fetch(
        `${API_URL}/coach/reviewed-debates`
    );

    const reviewedDebates =
    await reviewedResponse.json();

    document.getElementById(
        "completedReviews"
    ).innerText =
    reviewedDebates.length;
}

/* =========================
   REVIEW DEBATES
========================= */

function showDebates(){

    hideSections();

    document.getElementById(
        "debatesSection"
    ).style.display = "block";

    loadDebates();
}

async function loadDebates(){

    const response =
    await fetch(
        `${API_URL}/coach/debates`
    );

    const debates =
    await response.json();

    const container =
    document.getElementById(
        "debatesContainer"
    );

    container.innerHTML = "";

    if(debates.length === 0){

        container.innerHTML =
        "<h3>No Pending Reviews</h3>";

        return;
    }

    debates.forEach(debate=>{

        container.innerHTML += `

        <div class="user-card">

            <h3>${debate.topic}</h3>

            <p>
                Learner :
                ${debate.username}
            </p>

            <p>
                Status :
                ${debate.status}
            </p>

            <button
            onclick="viewDebate('${debate._id}')">

                Review Debate

            </button>

        </div>

        `;
    });
}

/* =========================
   VIEW DEBATE
========================= */

async function viewDebate(debateId){

    const response =
    await fetch(
        `${API_URL}/debates`
    );

    const debates =
    await response.json();

    const debate =
    debates.find(
        d => d._id === debateId
    );

    if(!debate){

        alert("Debate not found");

        return;
    }

    hideSections();

    document.getElementById(
        "reviewSection"
    ).style.display = "block";

    document.getElementById(
        "debateDetails"
    ).innerHTML = `

    <div class="review-card">

        <h2>
            ${debate.topic}
        </h2>

        <p>
            Learner :
            ${debate.username}
        </p>

        <p>
            Duration :
            ${debate.duration} Seconds
        </p>

        <audio controls>
            <source
            src="${API_URL}/${debate.audio_path}">
        </audio>

        <h3>
            Manual Evaluation
        </h3>

        <div class="score-grid">

            <input
            type="number"
            id="confidence"
            min="1"
            max="10"
            placeholder="Confidence (1-10)">

            <input
            type="number"
            id="fluency"
            min="1"
            max="10"
            placeholder="Fluency (1-10)">

            <input
            type="number"
            id="communication"
            min="1"
            max="10"
            placeholder="Communication (1-10)">

            <input
            type="number"
            id="argumentStrength"
            min="1"
            max="10"
            placeholder="Argument Strength (1-10)">

        </div>

        <textarea
        id="feedback"
        rows="6"
        placeholder="Enter Coach Feedback">
        </textarea>

        <button
        id="submitReviewBtn"
        onclick="submitFeedback('${debate._id}')">

            Submit Feedback

        </button>

    </div>

    `;
}

/* =========================
   SUBMIT FEEDBACK
========================= */

async function submitFeedback(debateId){

    const confidence =
    document.getElementById(
        "confidence"
    ).value;

    const fluency =
    document.getElementById(
        "fluency"
    ).value;

    const communication =
    document.getElementById(
        "communication"
    ).value;

    const argumentStrength =
    document.getElementById(
        "argumentStrength"
    ).value;

    const feedback =
    document.getElementById(
        "feedback"
    ).value;

    if(
        !confidence ||
        !fluency ||
        !communication ||
        !argumentStrength ||
        !feedback
    ){
        alert(
            "Fill all fields"
        );
        return;
    }

    const data = {

        debate_id:
        debateId,

        coach:
        localStorage.getItem(
            "fullname"
        ),

        confidence:
        confidence,

        fluency:
        fluency,

        communication:
        communication,

        argument_strength:
        argumentStrength,

        feedback:
        feedback
    };

    const response =
    await fetch(
        `${API_URL}/feedback`,
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(data)
        }
    );

    const result =
    await response.json();

    alert(
        result.message
    );

    showDebates();
}

/* =========================
   SHOW LEARNERS
========================= */

async function showLearners(){
    document.querySelector(".cards").style.display = "none";

    const response =
    await fetch(
        `${API_URL}/users/role/Learner`
    );

    const learners =
    await response.json();

    let html = `
<button onclick="showDashboard()" class="back-btn">
⬅ Back
</button>

<h2>Learners</h2>
`;
    learners.forEach(user=>{

        html += `

        <div class="user-card">

            <h3>
                ${user.fullname}
            </h3>

            <p>
                ${user.email}
            </p>

            <p>
                ${user.username}
            </p>

        </div>

        `;
    });

    hideSections();

document.getElementById(
    "dashboardSection"
).style.display = "block";

document.querySelector(".cards").style.display = "none";

document.getElementById(
    "dashboardResultSection"
).style.display = "block";

    document.getElementById(
        "dashboardResultSection"
    ).innerHTML = html;
}

/* =========================
   PENDING REVIEWS
========================= */

async function showPendingReviews(){
    document.querySelector(".cards").style.display = "none";
    hideSections();

document.getElementById(
    "dashboardSection"
).style.display = "block";

document.querySelector(".cards").style.display = "none";

document.getElementById(
    "dashboardResultSection"
).style.display = "block";

    const response =
    await fetch(
        `${API_URL}/coach/debates`
    );

    const debates =
    await response.json();

    let html = `
<button onclick="showDashboard()" class="back-btn">
⬅ Back
</button>

<h2>Pending Reviews</h2>
`;

    debates.forEach(debate=>{

        html += `

        <div class="user-card">

            <h3>
                ${debate.topic}
            </h3>

            <p>
                Learner :
                ${debate.username}
            </p>

            <button
            onclick="viewDebate('${debate._id}')">

                Review Debate

            </button>

        </div>

        `;
    });

    document.getElementById(
        "dashboardResultSection"
    ).style.display = "block";

    document.getElementById(
        "dashboardResultSection"
    ).innerHTML = html;
}

/* =========================
   COMPLETED REVIEWS
========================= */

async function showCompletedReviews(){
    document.querySelector(".cards").style.display = "none";
    hideSections();

document.getElementById(
    "dashboardSection"
).style.display = "block";

document.querySelector(".cards").style.display = "none";

document.getElementById(
    "dashboardResultSection"
).style.display = "block";

    const response =
    await fetch(
        `${API_URL}/coach/reviewed-debates`
    );

    const debates =
    await response.json();

    let html = `
<button onclick="showDashboard()" class="back-btn">
⬅ Back
</button>

<h2>Reviewed Debates</h2>
`;

    debates.forEach(debate=>{

        html += `

        <div class="user-card">

            <h3>${debate.topic}</h3>

            <p>
                <b>Learner:</b>
                ${debate.username}
            </p>

            <button
            onclick="viewCompletedReview('${debate._id}')">

                View Details

            </button>

        </div>

        `;
    });

    document.getElementById(
        "dashboardResultSection"
    ).style.display = "block";

    document.getElementById(
        "dashboardResultSection"
    ).innerHTML = html;
}
async function viewCompletedReview(debateId){

    const response =
    await fetch(
        `${API_URL}/review/${debateId}`
    );

    const review =
    await response.json();

    hideSections();

    document.getElementById(
        "reviewSection"
    ).style.display = "block";

    document.getElementById(
        "debateDetails"
    ).innerHTML = `

    <div class="review-card">

        <h2>
            ${review.topic || "Debate"}
        </h2>

        <p>
            <b>Learner:</b>
            ${review.username || ""}
        </p>

        <p>
            <b>Coach:</b>
            ${review.coach || ""}
        </p>

        <hr>

        <h3>Scores</h3>

        <p>
            <b>Confidence:</b>
            ${review.confidence || 0}/10
        </p>

        <p>
            <b>Fluency:</b>
            ${review.fluency || 0}/10
        </p>

        <p>
            <b>Communication:</b>
            ${review.communication || 0}/10
        </p>

        <p>
            <b>Argument Strength:</b>
            ${review.argument_strength || 0}/10
        </p>

        <hr>

        <h3>Feedback</h3>

        <div class="transcript-box">

            ${review.feedback || "No Feedback"}

        </div>

        <br>

        <button onclick="backToCompletedReviews()">
    Back
</button>

    </div>

    `;
}
function backToCompletedReviews(){

    hideSections();

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";

    document.getElementById(
        "dashboardResultSection"
    ).style.display = "block";

    showReviewedDebates();
}