
const API_URL = "http://127.0.0.1:8000";
console.log("learner.js loaded");
let mediaRecorder;
let audioChunks = [];
let audioBlob;
let debateId = null;

let countdown;
let remainingTime = 0;

/* =========================
   USER INFO
========================= */

const username =
    localStorage.getItem("username");

const fullname =
    localStorage.getItem("fullname");

const email =
    localStorage.getItem("email");

const role =
    localStorage.getItem("role");

document.getElementById("username").innerText =
    fullname || "User";

document.getElementById("email").innerText =
    email || "";

document.getElementById("role").innerText =
    role || "";

/* =========================
   PROFILE
========================= */

const profileBtn =
    document.getElementById("profileBtn");

const profilePopup =
    document.getElementById("profilePopup");

profileBtn.addEventListener("click", () => {

    if (profilePopup.style.display === "block") {
        profilePopup.style.display = "none";
    }
    else {
        profilePopup.style.display = "block";
    }

});

document.getElementById("logoutBtn")
.addEventListener("click", () => {

    localStorage.clear();

    window.location.href = "login.html";

});

/* =========================
   NAVIGATION
========================= */

function showDashboard() {

    console.log(
        "showDashboard called"
    );

    console.trace();

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";

    document.getElementById(
        "historySection"
    ).style.display = "none";

    document.getElementById(
        "tasksSection"
    ).style.display = "none";

    document.getElementById(
        "feedbackSection"
    ).style.display = "none";
}
function showHistory() {

    showOnly("historySection");

    loadHistory();
}

function showTasks() {

    showOnly("tasksSection");

    loadTasks();
}

function showFeedbacks() {

    showOnly("feedbackSection");

    loadFeedbacks();
}

function showOnly(id) {

    document.getElementById(
        "dashboardSection"
    ).style.display = "none";

    document.getElementById(
        "historySection"
    ).style.display = "none";

    document.getElementById(
        "tasksSection"
    ).style.display = "none";

    document.getElementById(
        "feedbackSection"
    ).style.display = "none";
    
    document.getElementById(
        "aiCoachStudioSection"
    ).style.display = "none";

    document.getElementById(id)
    .style.display = "block";
}

/* =========================
   AI DEBATE COACH STUDIO
========================= */

function showAiCoachStudio() {
    showOnly("aiCoachStudioSection");
}

let studioSessionTimer = null;
let studioSecondsElapsed = 0;

function startNewAiCoachSession() {
    const topic = prompt("Enter a debate topic to focus on:");
    if (!topic) return;

    document.getElementById("studioTopic").innerText = topic;
    document.getElementById("studioSide").innerText = "Proposition";
    
    // Reset Chat
    document.getElementById("studioChatBody").innerHTML = `
        <div class="studio-msg ai">
            <strong>AI Debate Coach</strong> <span class="badge">AI Coach</span>
            <p>Let's dive into "${topic}". Would you like to start with an opening statement, or explore potential arguments?</p>
        </div>
    `;

    // Reset Timer
    clearInterval(studioSessionTimer);
    studioSecondsElapsed = 0;
    document.getElementById("studioTimer").innerText = "00:00:00";
    studioSessionTimer = setInterval(() => {
        studioSecondsElapsed++;
        const h = Math.floor(studioSecondsElapsed / 3600);
        const m = Math.floor((studioSecondsElapsed % 3600) / 60);
        const s = studioSecondsElapsed % 60;
        document.getElementById("studioTimer").innerText = 
            `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
}

function endAiCoachSession() {
    clearInterval(studioSessionTimer);
    alert("Session Ended. Great work!");
}

async function sendStudioMessage() {
    const input = document.getElementById("studioChatInput");
    const message = input.value.trim();
    if (!message) return;

    input.value = "";
    
    const chatBody = document.getElementById("studioChatBody");
    chatBody.innerHTML += `
        <div class="studio-msg user">
            ${message}
        </div>
    `;
    chatBody.scrollTop = chatBody.scrollHeight;

    // Simulate thinking
    const typingId = "typing_" + Date.now();
    chatBody.innerHTML += `
        <div class="studio-msg ai" id="${typingId}">
            <strong>AI Debate Coach</strong> <span class="badge">AI Coach</span>
            <p><i>Thinking...</i></p>
        </div>
    `;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch(`${API_URL}/ai-chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username || "Learner",
                message: message,
                context: "studio"
            })
        });

        const data = await response.json();
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();

        const formattedReply = (data.reply || generateFallbackStudioReply(message))
            .replace(/✔/g, '✅')
            .replace(/\n/g, '<br>');

        chatBody.innerHTML += `
            <div class="studio-msg ai">
                <strong>AI Debate Coach</strong> <span class="badge">AI Coach</span>
                <p>${formattedReply}</p>
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;

        // Optionally update scores if backend returned them
        if (data.scores) {
            updateStudioScores(data.scores);
        }
    } catch (err) {
        console.warn("Backend /ai-chat failed. Using local fallback.");
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.remove();
        
        const fallback = generateFallbackStudioReply(message).replace(/\n/g, '<br>');
        chatBody.innerHTML += `
            <div class="studio-msg ai">
                <strong>AI Debate Coach</strong> <span class="badge">AI Coach</span>
                <p>${fallback}</p>
            </div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

document.getElementById("studioChatInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendStudioMessage();
});

function updateStudioScores(scores) {
    const els = document.querySelectorAll(".score-val");
    if (els.length >= 4) {
        els[0].innerHTML = `${scores.argument_quality || 85}<span>/100</span>`;
        els[1].innerHTML = `${scores.evidence_strength || 78}<span>/100</span>`;
        els[2].innerHTML = `${scores.logical_consistency || 82}<span>/100</span>`;
        els[3].innerHTML = `${scores.persuasiveness || 88}<span>/100</span>`;
    }
}

function generateFallbackStudioReply(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes("opening") || lower.includes("regulate") || lower.includes("social media")) {
        return `Here is a strong opening statement for the proposition side:\n\n"Social media has become an inseparable part of our daily lives. While it connects billions and facilitates the free exchange of ideas, it also spreads misinformation, hate speech, threatens privacy, and negatively impacts mental health—especially among young people. Regulation is not about restricting freedom, but about creating a safer, more responsible digital environment where technology serves humanity, not harms it. Therefore, social media should be regulated."\n\nWhy this works:\n✅ Timeliness relevance\n✅ Acknowledges benefits (balanced)\n✅ Highlights key harms\n✅ Frames regulation as responsible, not absolute\n✅ Clear and persuasive conclusion`;
    }
    return `That's an interesting point! Ensure you always follow up your assertions with strong evidence. Are there any potential counterarguments you should prepare for?`;
}

/* =========================
   START DEBATE
========================= */

async function startDebate() {

    const topic =
        document.getElementById("topic").value;

    const duration =
        document.getElementById("duration").value;

    const debateType =
        document.getElementById("debateType").value;

    if (!topic || !duration || !debateType) {

        alert(
            "Fill Topic, Duration and Debate Type"
        );

        return;
    }

    const response = await fetch(
        `${API_URL}/create-debate`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
                username,
                topic,
                duration,
                debate_type: debateType
            })
        }
    );

    const data =
        await response.json();

    debateId = data.debate_id;

    document.getElementById(
        "debateSection"
    ).style.display = "block";

    document.getElementById(
        "selectedTopic"
    ).innerText = topic;

    clearInterval(countdown);

    remainingTime =
        parseInt(duration);

    updateTimer();

    countdown =
        setInterval(() => {

            remainingTime--;

            updateTimer();

            if (remainingTime <= 0) {

                clearInterval(countdown);

                stopRecording();
            }

        }, 1000);
}

/* =========================
   TIMER
========================= */

function updateTimer() {

    const min =
        Math.floor(
            remainingTime / 60
        );

    const sec =
        remainingTime % 60;

    document.getElementById("timer")
    .innerText =
        `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

/* =========================
   RECORDING
========================= */

let isRecording = false;

document.getElementById("recordBtn")
.addEventListener("click", async () => {

    if (!debateId) {
        alert("Start Debate First");
        return;
    }

    if (!isRecording) {

        try {

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            mediaRecorder =
                new MediaRecorder(stream);

            audioChunks = [];

            mediaRecorder.ondataavailable =
            (event) => {

                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }

            };

            mediaRecorder.onstop =
            () => {

                audioBlob = new Blob(
                    audioChunks,
                    {
                        type: "audio/webm"
                    }
                );

                console.log("Audio Created");

                document.getElementById(
                    "submitBtn"
                ).style.display = "block";

            };

            mediaRecorder.start();

            isRecording = true;

            alert("Recording Started");

        }
        catch(error) {

            console.log(error);

            alert("Microphone Permission Denied");

        }

    }
    else {

        stopRecording();

    }

});

function stopRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state === "recording"
    ) {

        mediaRecorder.stop();

        isRecording = false;

        console.log(
            "Recording Stopped"
        );
    }
}
/* =========================
   SUBMIT AUDIO
========================= */

document.getElementById("submitBtn")
.addEventListener("click", async () => {

    console.log("STEP A");

    if (
        mediaRecorder &&
        mediaRecorder.state === "recording"
    ) {

        stopRecording();

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );
    }

    console.log("STEP B");

    if (!audioBlob) {

        alert("Record Audio First");
        return;
    }

    const formData = new FormData();

    formData.append(
        "debate_id",
        debateId
    );

    formData.append(
        "file",
        audioBlob,
        "debate.webm"
    );

    console.log("STEP C");

    clearInterval(countdown);

    document.getElementById(
        "dashboardSection"
    ).style.display = "none";

    document.getElementById(
        "loadingScreen"
    ).style.display = "flex";

    document.getElementById(
        "submitBtn"
    ).innerText = "Analyzing...";

    try {

        console.log("STEP D - BEFORE FETCH");

        const response = await fetch(
            `${API_URL}/upload-audio`,
            {
                method: "POST",
                body: formData
            }
        );

        console.log("STEP E - FETCH COMPLETED");

        const text =
            await response.text();

        console.log(
            "RAW RESPONSE:",
            text
        );

        const data =
            JSON.parse(text);

        console.log("STEP F");
        console.log(data);

        document.getElementById(
            "submitBtn"
        ).innerText = "Submit Debate";

        if (!data.success) {

            document.getElementById(
                "loadingScreen"
            ).style.display = "none";

            document.getElementById(
                "dashboardSection"
            ).style.display = "block";

            alert(data.message);

            return;
        }

        document.getElementById(
            "loadingScreen"
        ).style.display = "none";

        document.getElementById(
            "resultSection"
        ).style.display = "block";

        document.getElementById(
            "transcriptBox"
        ).innerText =
        data.transcript ||
        "No transcript available";

        document.getElementById(
            "aiResponseBox"
        ).innerText =
        data.ai_response ||
        "No AI response available";

       document.getElementById(
    "analysisBox"
).innerHTML = `

<div class="analysis-card">
    <h3>Confidence</h3>
    <p>${(data.analysis?.confidence || 0) * 10}%</p>
</div>

<div class="analysis-card">
    <h3>Fluency</h3>
    <p>${(data.analysis?.fluency || 0) * 10}%</p>
</div>

<div class="analysis-card">
    <h3>Argument Strength</h3>
    <p>${(data.analysis?.argument_strength || 0) * 10}%</p>
</div>

<div class="analysis-card">
    <h3>Communication</h3>
    <p>${(data.analysis?.communication || 0) * 10}%</p>
</div>

`;

        document.getElementById(
            "fallacyBox"
        ).innerHTML =
        (data.analysis?.fallacies || [])
        .join("<br>");

        document.getElementById(
            "suggestionBox"
        ).innerHTML =
        (data.analysis?.suggestions || [])
        .join("<br>");

        document.getElementById(
            "doneBtn"
        ).style.display = "block";

        console.log(
            "STEP G - RESULTS DISPLAYED"
        );

    }
    catch(error){

        console.error(
            "FETCH ERROR:",
            error
        );

        document.getElementById(
            "loadingScreen"
        ).style.display = "none";

        document.getElementById(
            "dashboardSection"
        ).style.display = "block";

        alert(
            "Error uploading audio"
        );
    }

});
/* =========================
   HISTORY
========================= */

async function loadHistory() {

    const response =
        await fetch(
            `${API_URL}/debates/${username}`
        );

    const debates =
        await response.json();

    const container =
        document.getElementById(
            "historyContainer"
        );

    container.innerHTML = "";
document.getElementById(
    "historyContainer"
).style.display = "block";

document.getElementById(
    "historyDetails"
).style.display = "none";

    document.getElementById(
        "historyDetails"
    ).style.display = "none";

    debates.forEach(item => {

        container.innerHTML += `

        <div
            class="history-card"
            onclick="viewDebate('${item._id}')">

            <h3>${item.topic}</h3>

            <p>
                Status:
                ${item.status}
            </p>

            <p>
                Date:
                ${item.created_at}
            </p>

        </div>

        `;
    });
}
async function viewDebate(debateId) {

    try {

        const response =
            await fetch(
                `${API_URL}/review/${debateId}`
            );

        const data =
            await response.json();

        /* Hide history list */
        document.getElementById(
            "historyContainer"
        ).style.display = "none";

        document.getElementById(
            "backHistoryBtn"
        ).style.display = "block";

        document.getElementById(
            "historyDetails"
        ).style.display = "block";

        /* Transcript */
        document.getElementById(
            "historyTranscript"
        ).innerText =
            data.transcript || "No transcript";

        /* AI Response */
        document.getElementById(
            "historyAiResponse"
        ).innerText =
            data.ai_response || "No AI response";

        /* Analysis - Same style as Dashboard */
        document.getElementById(
    "historyAnalysis"
).innerHTML = `

<div class="analysis-card">
    <h3>Confidence</h3>
    <p>${(data.confidence || 0) * 10}%</p>
</div>

<div class="analysis-card">
    <h3>Fluency</h3>
    <p>${(data.fluency || 0) * 10}%</p>
</div>

<div class="analysis-card">
    <h3>Argument Strength</h3>
    <p>${(data.argument_strength || 0) * 10}%</p>
</div>

<div class="analysis-card">
    <h3>Communication</h3>
    <p>${(data.communication || 0) * 10}%</p>
</div>

`;
        /* Fallacies */
        document.getElementById(
            "historyFallacies"
        ).innerHTML =

            Array.isArray(data.fallacies)
            ? data.fallacies.join("<br>")
            : "No Fallacies Detected";

        /* Suggestions */
        document.getElementById(
            "historySuggestions"
        ).innerHTML =

            Array.isArray(data.suggestions)
            ? data.suggestions.join("<br>")
            : "No Suggestions Available";

    }
    catch (error) {

        console.log(error);

        alert(
            "Unable to load debate details"
        );
    }
}
/* =========================
   TASKS
========================= */

async function loadTasks() {

    const response =
        await fetch(
            `${API_URL}/tasks/${username}`
        );

    const tasks =
        await response.json();

    const container =
        document.getElementById(
            "tasksContainer"
        );

    container.innerHTML = "";

    tasks.forEach(item => {

        container.innerHTML += `

<div class="task-card">

    <h3>
        ${item.topic}
    </h3>

    <p>
        <b>Assigned By:</b>
        ${item.sender_name}
    </p>

    <p>
        <b>Role:</b>
        ${item.sender_role}
    </p>

    <p>
        <b>Duration:</b>
        ${item.duration}
    </p>

    <p>
        <b>Debate Type:</b>
        ${item.debate_type}
    </p>

    <p>
        <b>Status:</b>
        ${item.status || "Pending"}
    </p>

    <button
    class="complete-btn"
    data-id="${item._id}"
    data-topic="${item.topic}"
    data-duration="${item.duration}"
    data-type="${item.debate_type}">

    Complete Task

</button>

</div>

`;
    });
    document.querySelectorAll(".complete-btn")
.forEach(btn => {

    btn.addEventListener("click", () => {

        completeTask(
            btn.dataset.id,
            btn.dataset.topic,
            btn.dataset.duration,
            btn.dataset.type
        );

    });

});
}
/* =========================
   FEEDBACK
========================= */

async function loadFeedbacks() {

    const response =
        await fetch(
            `${API_URL}/user-feedback/${username}`
        );

    const feedbacks =
        await response.json();

    const container =
        document.getElementById(
            "feedbackContainer"
        );

    container.innerHTML = "";

    feedbacks.forEach(item => {

        container.innerHTML += `

<div class="feedback-card">

    <h3>
        ${item.topic || "General Feedback"}
    </h3>

    <p>
        <b>Sender:</b>
        ${item.sender_name || "Unknown"}
    </p>

    <p>
        <b>Role:</b>
        ${item.sender_role || ""}
    </p>

    ${
        item.confidence !== undefined
        ? `
        <hr><br>

        <p><b>Confidence:</b> ${item.confidence}/10</p>

        <p><b>Fluency:</b> ${item.fluency}/10</p>

        <p><b>Communication:</b> ${item.communication}/10</p>

        <p><b>Argument Strength:</b> ${item.argument_strength}/10</p>

        <br>
        `
        : ""
    }

    <p>
        <b>Feedback:</b><br>
        ${item.feedback || item.message || "No feedback"}
    </p>

</div>

`;
    });
}
function finishDebate() {

    clearInterval(countdown);

    document.getElementById(
        "topic"
    ).value = "";

    document.getElementById(
        "duration"
    ).value = "";

    document.getElementById(
        "debateType"
    ).value = "";

    document.getElementById(
        "topic"
    ).style.display = "block";

    document.getElementById(
        "duration"
    ).style.display = "block";

    document.getElementById(
        "debateType"
    ).style.display = "block";

    document.getElementById(
        "startBtn"
    ).style.display = "block";

    document.getElementById(
        "debateSection"
    ).style.display = "none";

    document.getElementById(
        "loadingScreen"
    ).style.display = "none";

    document.getElementById(
        "resultSection"
    ).style.display = "none";

    document.getElementById(
        "dashboardSection"
    ).style.display = "block";

    document.getElementById(
        "transcriptBox"
    ).innerHTML = "";

    document.getElementById(
        "aiResponseBox"
    ).innerHTML = "";

    document.getElementById(
        "analysisBox"
    ).innerHTML = "";

    document.getElementById(
        "fallacyBox"
    ).innerHTML = "";

    document.getElementById(
        "suggestionBox"
    ).innerHTML = "";

    debateId = null;
    audioBlob = null;
}
function backToHistory(){

    document.getElementById(
        "historyContainer"
    ).style.display = "block";

    document.getElementById(
        "historyDetails"
    ).style.display = "none";

    document.getElementById(
        "backHistoryBtn"
    ).style.display = "none";
}
async function completeTask(
    taskId,
    topic,
    duration,
    debateType
) {

    await fetch(
        `${API_URL}/tasks/complete/${taskId}`,
        {
            method: "PUT"
        }
    );

    showDashboard();

    document.getElementById(
        "topic"
    ).value = topic;

    document.getElementById(
        "duration"
    ).value = duration;

    document.getElementById(
        "debateType"
    ).value = debateType;

    alert(
        "Task loaded successfully. Click Start Debate."
    );
}