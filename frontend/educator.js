const API_URL = "http://127.0.0.1:8000";

document.getElementById("educatorName").innerText =
localStorage.getItem("fullname") || "Educator";

document.getElementById("educatorRole").innerText =
localStorage.getItem("role") || "Educator";

showDashboard();

/* ==========================
   HIDE SECTIONS
========================== */

function hideSections(){

    document.getElementById("dashboardSection").style.display = "none";

    document.getElementById("assignTaskSection").style.display = "none";

    document.getElementById("reportsSection").style.display = "none";

    document.getElementById("learnerProfileSection").style.display = "none";

    document.getElementById("resultSection").style.display = "none";
}

/* ==========================
   DASHBOARD
========================== */

function showDashboard(){

    hideSections();

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";

    loadStats();
}

async function loadStats(){

    try{

        const learners =
        await fetch(
            `${API_URL}/educator/learners-count`
        );

        const learnerData =
        await learners.json();

        document.getElementById(
            "totalLearners"
        ).innerText =
        learnerData.count;

        const tasks =
        await fetch(
            `${API_URL}/educator/tasks-count`
        );

        const taskData =
        await tasks.json();

        document.getElementById(
            "totalTasks"
        ).innerText =
        taskData.count;

        const feedbacks =
        await fetch(
            `${API_URL}/educator/feedback-count`
        );

        const feedbackData =
        await feedbacks.json();

        document.getElementById(
            "totalFeedback"
        ).innerText =
        feedbackData.count;

    }
    catch(error){

        console.log(error);

        alert(
            "Unable to load dashboard"
        );
    }
}

/* ==========================
   ASSIGN TASK
========================== */

function showAssignTask(){

    hideSections();

    document.getElementById(
        "assignTaskSection"
    ).style.display = "block";

    loadLearnerDropdown();
}

async function loadLearnerDropdown(){

    const response =
    await fetch(
        `${API_URL}/users/role/Learner`
    );

    const learners =
    await response.json();

    const select =
    document.getElementById(
        "learnerSelect"
    );

    select.innerHTML =
    `<option value="">
        Select Learner
    </option>`;

    learners.forEach(user=>{

        select.innerHTML += `

        <option value="${user.username}">
            ${user.fullname}
        </option>

        `;
    });
}

document.getElementById("taskForm")
.addEventListener("submit", async(e)=>{

    e.preventDefault();

   const data = {

    username:
    document.getElementById(
        "learnerSelect"
    ).value,

    topic:
    document.getElementById(
        "topic"
    ).value,

    duration:
    document.getElementById(
        "duration"
    ).value,

    debate_type:
    document.getElementById(
        "debateType"
    ).value,

    sender_name:
    localStorage.getItem(
        "fullname"
    ),

    sender_role:
    localStorage.getItem(
        "role"
    )
};
    const response =
    await fetch(
        `${API_URL}/assign-task`,
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

    alert(result.message);

    document.getElementById(
        "taskForm"
    ).reset();
});

/* ==========================
   LOGOUT
========================== */

function logout(){

    localStorage.clear();

    window.location.href =
    "login.html";
}
/* ==========================
   LEARNERS LIST
========================== */

async function showLearners(){

    hideSections();

    document.getElementById(
        "resultSection"
    ).style.display = "block";

    const response =
    await fetch(
        `${API_URL}/users/role/Learner`
    );

    const learners =
    await response.json();

    let html = `

    <button
    class="back-btn"
    onclick="showDashboard()">
        ← Back
    </button>

    <h2>Learners</h2>

    `;

    learners.forEach(user=>{

        html += `

        <div class="user-card">

            <h3>${user.fullname}</h3>

            <p>${user.email}</p>

            <p>${user.username}</p>

            <button
            onclick="viewLearner('${user.username}')">
                View Details
            </button>

        </div>

        `;
    });

    document.getElementById(
        "resultSection"
    ).innerHTML = html;
}

/* ==========================
   LEARNER PROFILE
========================== */

async function viewLearner(username){

    hideSections();

    document.getElementById(
        "learnerProfileSection"
    ).style.display = "block";

    const usersResponse =
    await fetch(
        `${API_URL}/users`
    );

    const users =
    await usersResponse.json();

    const user =
    users.find(
        u => u.username === username
    );

    const debatesResponse =
    await fetch(
        `${API_URL}/debates/${username}`
    );

    const debates =
    await debatesResponse.json();

    let debateHTML = "";

    debates.forEach(debate=>{

        debateHTML += `

        <li>
            <b>${debate.topic}</b>
            (${debate.status})
        </li>

        `;
    });

    document.getElementById(
        "learnerProfile"
    ).innerHTML = `

    <div class="profile-box">

        <button
        class="back-btn"
        onclick="showLearners()">
            ← Back
        </button>

        <h2>${user.fullname}</h2>

        <p>
        <b>Email:</b>
        ${user.email}
        </p>

        <p>
        <b>Username:</b>
        ${user.username}
        </p>

        <p>
        <b>Role:</b>
        ${user.role}
        </p>

        <p>
        <b>Status:</b>
        ${user.status || "Active"}
        </p>

        <hr>

        <h3>
        Debate History
        </h3>

        <ul>
            ${
                debateHTML ||
                "<li>No debates found</li>"
            }
        </ul>

        <hr>

        <h3>
        Send Feedback
        </h3>

        <textarea
        id="educatorFeedback"
        rows="5"
        placeholder="Enter feedback">
        </textarea>

        <br><br>

        <button
        onclick="sendEducatorFeedback('${user.username}')">
            Send Feedback
        </button>

    </div>

    `;
}

/* ==========================
   SEND FEEDBACK
========================== */

async function sendEducatorFeedback(username){

    const message =
    document.getElementById(
        "educatorFeedback"
    ).value.trim();

    if(!message){

        alert(
            "Enter feedback"
        );

        return;
    }

    const response =
    await fetch(
        `${API_URL}/send-feedback`,
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                username:username,

                message:message,

                sender_name:
                localStorage.getItem(
                    "fullname"
                ),

                sender_role:
                localStorage.getItem(
                    "role"
                )
            })
        }
    );

    const result =
    await response.json();

    alert(result.message);

    document.getElementById(
        "educatorFeedback"
    ).value = "";
}

/* ==========================
   TASKS LIST
========================== */

async function showTasks(){

    hideSections();

    document.getElementById(
        "resultSection"
    ).style.display = "block";

    const response =
    await fetch(
        `${API_URL}/tasks`
    );

    const tasks =
    await response.json();

    let html = `

    <button
    class="back-btn"
    onclick="showDashboard()">
        ← Back
    </button>

    <h2>Assigned Tasks</h2>

    `;

    tasks.forEach(task=>{

        html += `

        <div class="result-card">

            <h3>${task.topic}</h3>

            <p>
            Learner :
            ${task.username}
            </p>

            <p>
            Duration :
            ${task.duration}
            </p>

        </div>

        `;
    });

    document.getElementById(
        "resultSection"
    ).innerHTML = html;
}
/* ==========================
   FEEDBACKS
========================== */

async function showFeedbacks(){

    hideSections();

    document.getElementById(
        "resultSection"
    ).style.display = "block";

    const response =
    await fetch(
        `${API_URL}/all-feedbacks`
    );

    const feedbacks =
    await response.json();

    let html = `

    <button
    class="back-btn"
    onclick="showDashboard()">
        ← Back
    </button>

    <h2>Feedbacks</h2>

    `;

    feedbacks.forEach(feed=>{

        html += `

        <div class="result-card">

            <h3>
    ${feed.learner_name}
</h3>

<p>
    Role:
    ${feed.learner_role}
</p>

            <p>
            ${feed.message}
            </p>

        </div>

        `;
    });

    document.getElementById(
        "resultSection"
    ).innerHTML = html;
}

/* ==========================
   REPORTS
========================== */

function showReports(){

    hideSections();

    document.getElementById(
        "resultSection"
    ).style.display = "block";

    loadReports();
}

async function loadReports(){

    const response =
    await fetch(
        `${API_URL}/educator/reports`
    );

    const reports =
    await response.json();

    let html = `

    <button
    class="back-btn"
    onclick="showDashboard()">
        ← Back
    </button>

    <h2>Learner Reports</h2>

    `;

    reports.forEach(report=>{

        html += `

        <div class="user-card">

            <h3>
            ${report.fullname}
            </h3>

            <p>
            Email :
            ${report.email}
            </p>

            <p>
            Total Tasks :
            ${report.tasks}
            </p>

            <p>
            Total Debates :
            ${report.debates}
            </p>

            <p>
            Total Feedbacks :
            ${report.feedbacks}
            </p>

            <button
            onclick="viewLearner('${report.username}')">
                View Details
            </button>

        </div>

        `;
    });

    document.getElementById(
        "resultSection"
    ).innerHTML = html;
}