import { useNavigate } from "react-router-dom";

function TopicCard({ title, level }) {

    const navigate = useNavigate();

    return (

        <div className="topic-card">

            <h2>{title}</h2>

            <p>{level}</p>

            <button
                onClick={() => navigate("/session")}
            >
                Start Debate
            </button>

        </div>

    );

}

export default TopicCard;