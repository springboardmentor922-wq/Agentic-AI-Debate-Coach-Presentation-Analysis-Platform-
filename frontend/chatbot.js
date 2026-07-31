/* =========================================================
   GLOBAL FLOATING AI CHATBOT WIDGET LOGIC
   ========================================================= */

(function () {
    const API_BASE_URL = "http://127.0.0.1:8000";

    function initFloatingChatbot() {
        if (document.getElementById("chatbotFloatBtn")) return;

        // 1. Inject Float Button HTML
        const floatBtn = document.createElement("button");
        floatBtn.id = "chatbotFloatBtn";
        floatBtn.className = "chatbot-float-btn";
        floatBtn.setAttribute("title", "AI Debate Coach Assistant");
        floatBtn.innerHTML = `🤖<span class="chatbot-badge"></span>`;
        document.body.appendChild(floatBtn);

        // 2. Inject Modal Container HTML
        const modal = document.createElement("div");
        modal.id = "chatbotModal";
        modal.className = "chatbot-modal";
        modal.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">🤖</div>
                    <div class="chatbot-header-text">
                        <h4>AI Debate Coach</h4>
                        <span>Online • Instant Guidance</span>
                    </div>
                </div>
                <button class="chatbot-close-btn" id="chatbotCloseBtn">&times;</button>
            </div>
            
            <div class="chatbot-body" id="chatbotBody">
                <div class="chatbot-msg ai">
                    Hello! I'm your AI Debate & Speech Coach. Ask me about opening statements, logical fallacies, rebuttal strategies, or argument scoring!
                    <div class="chatbot-msg-time">Just now</div>
                </div>
            </div>

            <div class="chatbot-suggestions">
                <div class="chatbot-chip" data-query="Give me a strong opening statement on Social Media regulation.">Opening Statement</div>
                <div class="chatbot-chip" data-query="What is an Ad Hominem fallacy and how do I counter it?">Identify Fallacies</div>
                <div class="chatbot-chip" data-query="How can I improve my argument persuasiveness score?">Improve Persuasiveness</div>
            </div>

            <div class="chatbot-footer">
                <input type="text" id="chatbotInput" class="chatbot-input" placeholder="Ask AI Debate Coach..." />
                <button id="chatbotSendBtn" class="chatbot-send-btn">➔</button>
            </div>
        `;
        document.body.appendChild(modal);

        // 3. Event Listeners
        floatBtn.addEventListener("click", () => {
            modal.classList.toggle("active");
            if (modal.classList.contains("active")) {
                document.getElementById("chatbotInput").focus();
            }
        });

        document.getElementById("chatbotCloseBtn").addEventListener("click", () => {
            modal.classList.remove("active");
        });

        const sendBtn = document.getElementById("chatbotSendBtn");
        const inputField = document.getElementById("chatbotInput");

        sendBtn.addEventListener("click", handleSend);
        inputField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSend();
        });

        // Chips click listeners
        document.querySelectorAll(".chatbot-chip").forEach((chip) => {
            chip.addEventListener("click", () => {
                const text = chip.getAttribute("data-query");
                if (text) {
                    inputField.value = text;
                    handleSend();
                }
            });
        });
    }

    async function handleSend() {
        const inputField = document.getElementById("chatbotInput");
        const message = inputField.value.trim();
        if (!message) return;

        inputField.value = "";
        appendMessage(message, "user");

        // Show typing indicator
        const typingId = appendTypingIndicator();

        try {
            const currentUser = localStorage.getItem("username") || "Learner";
            const response = await fetch(`${API_BASE_URL}/ai-chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: currentUser,
                    message: message,
                    context: "floating_widget"
                })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);

            if (data && data.reply) {
                appendMessage(data.reply, "ai");
            } else {
                appendMessage(generateFallbackReply(message), "ai");
            }
        } catch (err) {
            console.warn("Backend chat unavailable, using local coach generator.", err);
            removeTypingIndicator(typingId);
            appendMessage(generateFallbackReply(message), "ai");
        }
    }

    function appendMessage(text, sender) {
        const chatBody = document.getElementById("chatbotBody");
        const msgDiv = document.createElement("div");
        msgDiv.className = `chatbot-msg ${sender}`;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Format markdown checkmarks or bullet points cleanly
        let formattedText = text
            .replace(/✔/g, '✅')
            .replace(/\n/g, '<br>');

        msgDiv.innerHTML = `
            ${formattedText}
            <div class="chatbot-msg-time">${timeStr}</div>
        `;

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function appendTypingIndicator() {
        const chatBody = document.getElementById("chatbotBody");
        const typingDiv = document.createElement("div");
        const id = "typing_" + Date.now();
        typingDiv.id = id;
        typingDiv.className = "chatbot-msg ai";
        typingDiv.style.fontStyle = "italic";
        typingDiv.style.opacity = "0.7";
        typingDiv.innerText = "AI Debate Coach is analyzing...";
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const elem = document.getElementById(id);
        if (elem) elem.remove();
    }

    function generateFallbackReply(prompt) {
        const lower = prompt.toLowerCase();
        if (lower.includes("opening statement") || lower.includes("regulate") || lower.includes("social media")) {
            return `Here is a strong opening statement:\n\n"Social media platforms have transformed into digital public squares, yet without accountability, they propagate misinformation and mental health harms. Regulation is not about restricting speech, but about enforcing transparency, protecting youth, and holding platform algorithms accountable."\n\nWhy this works:\n✔ Timeliness & Relevance\n✔ Acknowledges benefits while focusing on harms\n✔ Clear, persuasive stance`;
        } else if (lower.includes("fallacy") || lower.includes("ad hominem")) {
            return `An **Ad Hominem** fallacy occurs when an opponent attacks a person's character instead of addressing their argument.\n\nHow to counter it:\n1. Calmly point out: "My opponent is addressing personal character rather than the logic or evidence presented."\n2. Redirect back to your primary evidence point.`;
        } else if (lower.includes("persuasive") || lower.includes("score")) {
            return `To boost your Persuasiveness & Evidence scores:\n1. Cite specific data points or real-world case studies.\n2. Use the **ARE structure**: Assertion, Reasoning, Evidence.\n3. Anticipate the opponent's counterargument early in your turn!`;
        }
        return `Great point! When constructing your argument for "${prompt}", ensure you state your central Assertion clearly, back it up with empirical Evidence, and explicitly state why it matters (Impact). Would you like me to analyze a specific draft statement for fallacies?`;
    }

    // Auto-init on page load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFloatingChatbot);
    } else {
        initFloatingChatbot();
    }
})();
