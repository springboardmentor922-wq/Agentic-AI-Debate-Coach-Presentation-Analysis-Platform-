import "./DashboardCards.css";

const WelcomeCard = ({ user }) => {

    return (

        <div className="welcome-card">

            <div>

                <h1>

                    Welcome back,

                    <span>

                        {" "}

                        {user?.full_name || "Learner"}

                    </span>

                    👋

                </h1>

                <p>

                    Continue improving your communication,

                    debate and presentation skills today.

                </p>

            </div>

            <div className="welcome-image">

                🚀

            </div>

        </div>

    );

};

export default WelcomeCard;