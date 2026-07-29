import "./DashboardCards.css";

const ActionCard = ({

    title,

    description,

    icon,

    onClick

}) => {

    return (

        <div

            className="action-card"

            onClick={onClick}

        >

            <div className="action-icon">

                {icon}

            </div>

            <h3>

                {title}

            </h3>

            <p>

                {description}

            </p>

        </div>

    );

};

export default ActionCard;