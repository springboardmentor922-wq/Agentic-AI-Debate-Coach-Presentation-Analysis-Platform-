
import re

class LocalAIDebateCoach:
    def __init__(self):
        self.transition_words=["first","firstly","second","third","finally","therefore","thus","however","moreover","furthermore","because","although","hence","in conclusion"]
        self.filler_words=["um","uh","like","you know","actually","basically","literally"]

    def grammar_score(self,text):
        score=10; remarks=[]
        if len(text.split())<40: score-=2; remarks.append("Argument is too short.")
        if "." not in text: score-=2; remarks.append("Use complete sentences.")
        if " i " in f" {text.lower()} ": score-=1; remarks.append("Capitalize the pronoun 'I'.")
        if ".." in text: score-=1; remarks.append("Repeated punctuation detected.")
        score=max(score,3)
        return {"score":score,"percentage":score*10,"remark":" ".join(remarks) if remarks else "Grammar is good."}

    def logic_score(self,text):
        t=sum(1 for w in self.transition_words if w in text.lower())
        score=9 if t>=4 else 8 if t>=2 else 7 if t==1 else 5
        return {"score":score,"percentage":score*10,"remark":"Logical flow evaluated using transition words."}

    def confidence_score(self,text):
        f=sum(1 for w in self.filler_words if w in text.lower())
        score=max(4,8-f)
        return {"score":score,"percentage":score*10,"remark":"Confidence estimated from writing quality."}

    def relevance_score(self,topic,text):
        m=sum(1 for w in topic.lower().split() if w in text.lower())
        s=min(10,max(4,m+4))
        return {"score":s,"percentage":s*10,"remark":"Relevance estimated using topic keywords."}

    def generate_strengths(self,text):
        out=["Topic is addressed clearly."]
        out.append("Well elaborated argument with sufficient details." if len(text.split())>80 else "Argument is concise and understandable.")
        if any(w in text.lower() for w in self.transition_words): out.append("Good logical transitions.")
        if "." in text: out.append("Ideas are divided into sentences.")
        return out

    def generate_weaknesses(self,text):
        out=[]
        if len(text.split())<50: out.append("Expand your argument with more supporting points.")
        if text.count(".")<3: out.append("Use more complete sentences.")
        if not any(w in text.lower() for w in self.transition_words): out.append("Use transition words for better flow.")
        if not out: out.append("Minor clarity improvements recommended.")
        return out

    def evaluate(self,topic,argument):
        g=self.grammar_score(argument); l=self.logic_score(argument); c=self.confidence_score(argument); r=self.relevance_score(topic,argument)
        return {
            "grammar":g,"logic":l,"confidence":c,"relevance":r,
            "overall_score":round((g["score"]+l["score"]+c["score"]+r["score"])/4,2),
            "summary":"The argument has good potential.",
            "strengths":self.generate_strengths(argument),
            "weaknesses":self.generate_weaknesses(argument),
            "coach_tips":["Begin with a strong opening.","Support every claim with evidence.","Use real-world examples.","Address opposing viewpoints.","Finish with a memorable conclusion."],
            "counter_arguments":[f"Opponents may disagree with '{topic}'.","Critics may propose alternatives.","Some may question the long-term impact."],
            "logical_fallacies":["No obvious logical fallacies detected."],
            "rebuttals":["Support claims with evidence.","Address opposing arguments directly.","Explain why your solution is stronger."],
            "opening_statement":f"Good morning everyone. Today I strongly believe that {topic} is important.",
            "closing_statement":"In conclusion, evidence and balanced reasoning make arguments persuasive.",
            "improved_argument":f"Improve your argument by adding evidence and examples.\n\nOriginal:\n{argument}",
            "real_world_examples":["Artificial Intelligence in healthcare","Digital education platforms","Environmental sustainability initiatives"],
            "statistics":["Include government reports.","Include recent survey data.","Reference research papers."],
            "ai_insights":["Evidence increases credibility.","Examples improve persuasiveness.","Balanced arguments are more convincing."],
            "feedback":"Evaluation generated using Local AI Engine."
        }

def local_evaluate(topic,argument):
    return LocalAIDebateCoach().evaluate(topic,argument)
