document.getElementById("adminName").innerText =
localStorage.getItem("fullname") || "Admin";

document.getElementById("adminRole").innerText =
localStorage.getItem("role") || "Admin";

showDashboard();

function showDashboard(){

    document.getElementById("dashboardSection")
    .style.display = "block";
    document.querySelector(".cards").style.display = "grid";

    document.getElementById("createUserSection")
    .style.display = "none";

    document.getElementById("feedbackSection")
    .style.display = "none";

    document.getElementById("roleUsersSection")
    .style.display = "none";

    document.getElementById("userProfileSection")
    .style.display = "none";

    loadStats();

}

function showCreateUser(){

    document.getElementById("dashboardSection")
    .style.display = "none";

    document.getElementById("createUserSection")
    .style.display = "block";

    document.getElementById("feedbackSection")
    .style.display = "none";

    document.getElementById("roleUsersSection")
    .style.display = "none";

    document.getElementById("userProfileSection")
    .style.display = "none";
}
function logout(){

    localStorage.clear();

    window.location.href="login.html";
}

async function loadStats(){

    try{

        const response =
        await fetch(
            "http://127.0.0.1:8000/admin/stats"
        );

        const data =
        await response.json();

        document.getElementById("totalUsers")
        .innerText=data.total_users;

        document.getElementById("totalDebates")
        .innerText=data.total_debates;

        document.getElementById("learners")
        .innerText=data.learners;

        document.getElementById("educators")
        .innerText=data.educators;

        document.getElementById("coaches")
        .innerText=data.coaches;

        document.getElementById("admins")
        .innerText=data.admins;

    }
    catch(error){

        console.log(error);

        alert("Unable to load dashboard statistics");
    }
}

document.getElementById("createUserForm")
.addEventListener("submit", async(e)=>{

    e.preventDefault();

    const userData={

        fullname:
        document.getElementById("fullname").value,

        email:
        document.getElementById("email").value,

        username:
        document.getElementById("username").value,

        password:
        document.getElementById("password").value,

        role:
        document.getElementById("role").value
    };

    try{

        const response =
        await fetch(
            "http://127.0.0.1:8000/admin/create-user",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(userData)
            }
        );

        const result =
        await response.json();

        alert(result.message);

        document
        .getElementById("createUserForm")
        .reset();

        loadStats();

    }
    catch(error){

        console.log(error);

        alert("Unable to create user");
    }

});
async function loadRoleUsers(role){
    document.querySelector(".cards").style.display = "none";
    document.getElementById("feedbackSection").style.display = "none";
    document.getElementById("userProfileSection").style.display = "none";

    const response =
    await fetch(
        `http://127.0.0.1:8000/users/role/${role}`
    );

    const users =
    await response.json();

    let html = `
<button class="back-btn" onclick="showDashboard()">
⬅ Back
</button>
`;

    users.forEach(user=>{

        html += `
        <div class="user-card"
             onclick="viewUser('${user.username}')">

            <h3>${user.fullname}</h3>

            <p>${user.email}</p>

            <p>${user.role}</p>

        </div>
        `;
    });

    document.getElementById("roleTitle")
    .innerText = role + " List";

    document.getElementById("roleUsersContainer")
    .innerHTML = html;

    document.getElementById("roleUsersSection")
    .style.display="block";
}
async function viewUser(username){
    document.getElementById("roleUsersSection").style.display = "none";

    const usersResponse =
    await fetch(
        "http://127.0.0.1:8000/users"
    );

    const users =
    await usersResponse.json();

    const user =
    users.find(
        u => u.username === username
    );

    const debatesResponse =
    await fetch(
        `http://127.0.0.1:8000/debates/${username}`
    );

    const debates =
    await debatesResponse.json();

    let topics = "";

    debates.forEach(debate=>{

        topics += `
        <li>${debate.topic}</li>
        `;
    });

    document.getElementById(
    "userProfile"
).innerHTML = `

    <button class="back-btn"
    onclick="
        document.getElementById('userProfileSection').style.display='none';
        document.getElementById('roleUsersSection').style.display='block';
    ">
        ⬅ Back
    </button>

    <div class="profile-box">

        <h3>${user.fullname}</h3>

        <p><b>Email:</b>
        ${user.email}</p>

        <p><b>Username:</b>
        ${user.username}</p>

        <p><b>Role:</b>
        ${user.role}</p>

        <p><b>Status:</b>
        ${user.status || 'Active'}</p>

        <hr><br>

        <h3>
        Debates Attempted:
        ${debates.length}
        </h3>

        <ul>
            ${topics || "<li>No debates attempted</li>"}
        </ul>

        <br>

        <button onclick="deleteUser('${user._id}')">
            Delete User
        </button>

        <button onclick="openFeedbackBox('${user.username}')">
            Send Feedback
        </button>

    </div>
`;
    document.getElementById(
        "userProfileSection"
    ).style.display="block";
}
async function loadAllUsers(){
    document.querySelector(".cards").style.display = "none";
    document.getElementById("feedbackSection").style.display = "none";
    document.getElementById("userProfileSection").style.display = "none";

    const response =
    await fetch(
        "http://127.0.0.1:8000/users"
    );

    const users =
    await response.json();

    let html = `
<button class="back-btn" onclick="showDashboard()">
⬅ Back
</button>
`;

    users.forEach(user=>{

        html += `
        <div class="user-card"
             onclick="viewUser('${user.username}')">

            <h3>${user.fullname}</h3>

            <p>${user.email}</p>

            <p>${user.role}</p>

        </div>
        `;
    });

    document.getElementById(
        "roleTitle"
    ).innerText = "All Users";

    document.getElementById(
        "roleUsersContainer"
    ).innerHTML = html;

    document.getElementById(
        "roleUsersSection"
    ).style.display="block";
}
async function loadDebates(){
    document.querySelector(".cards").style.display = "none";
    document.getElementById("feedbackSection").style.display = "none";
    document.getElementById("userProfileSection").style.display = "none";

    const response =
    await fetch(
        "http://127.0.0.1:8000/debates"
    );

    const debates =
    await response.json();

    let html = `
<button class="back-btn" onclick="showDashboard()">
⬅ Back
</button>
`;

    debates.forEach(debate=>{

        html += `
        <div class="user-card">

            <h3>${debate.topic}</h3>

            <p>${debate.username}</p>

            <p>${debate.status}</p>

        </div>
        `;
    });

    document.getElementById(
        "roleTitle"
    ).innerText = "Debates";

    document.getElementById(
        "roleUsersContainer"
    ).innerHTML = html;

    document.getElementById(
        "roleUsersSection"
    ).style.display="block";
}
async function deleteUser(userId){

    const confirmDelete =
    confirm("Delete this user?");

    if(!confirmDelete) return;

    const response =
    await fetch(
        `http://127.0.0.1:8000/users/${userId}`,
        {
            method:"DELETE"
        }
    );

    const result =
    await response.json();

    alert(result.message);

    loadStats();

    document.getElementById(
        "userProfileSection"
    ).style.display="none";
}
async function viewFeedback(username){

    const debatesResponse =
    await fetch(
        `http://127.0.0.1:8000/debates/${username}`
    );

    const debates =
    await debatesResponse.json();

    let html = "";

    for(const debate of debates){

        const feedbackResponse =
        await fetch(
            `http://127.0.0.1:8000/feedback/${debate._id}`
        );

        const feedbacks =
        await feedbackResponse.json();

        feedbacks.forEach(f=>{

            html += `
            <div class="user-card">

                <h3>${debate.topic}</h3>

                <p>
                Confidence:
                ${f.confidence}
                </p>

                <p>
                Fluency:
                ${f.fluency}
                </p>

                <p>
                Communication:
                ${f.communication}
                </p>

                <p>
                ${f.feedback}
                </p>

            </div>
            `;
        });
    }

    document.getElementById(
        "feedbackContainer"
    ).innerHTML = html || "No Feedback Available";

    document.getElementById(
        "feedbackSection"
    ).style.display="block";
}
function openFeedbackBox(username){

    document.getElementById("feedbackSection")
    .style.display = "block";

    document.getElementById("feedbackUsername")
    .value = username;
}
async function sendFeedback(){

    const username =
    document.getElementById(
        "feedbackUsername"
    ).value;

    const message =
    document.getElementById(
        "feedbackText"
    ).value;

    if(message === ""){

        alert("Enter feedback");

        return;
    }

    const response =
    await fetch(
        "http://127.0.0.1:8000/admin/send-feedback",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
    username: username,
    message: message,
    sender_name: localStorage.getItem("fullname"),
    sender_role: localStorage.getItem("role")
})
        }
    );

    const result =
    await response.json();

    alert(result.message);

    document.getElementById(
        "feedbackText"
    ).value = "";
}