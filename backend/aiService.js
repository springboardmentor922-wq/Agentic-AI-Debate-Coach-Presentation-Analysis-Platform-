const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFeedback = async (topic, stance, argument) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are an expert debate coach.

Analyze this student's debate argument.

Topic: ${topic}
Stance: ${stance}
Argument: ${argument}

Give:
1. Strengths
2. Weaknesses
3. Suggestions

Also give scores (0-100) for:
- communication
- argument strength
- confidence

Return ONLY JSON like this:
{
  "feedback": "...",
  "communicationScore": 0,
  "argumentScore": 0,
  "confidenceScore": 0
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🧠 Clean Gemini response (important)
    const cleaned = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleaned);

    return parsed;

  } catch (error) {
    console.log("Gemini Error:", error);

    return {
      feedback: "Unable to generate AI feedback",
      communicationScore: 0,
      argumentScore: 0,
      confidenceScore: 0
    };
  }
};

module.exports = generateFeedback;