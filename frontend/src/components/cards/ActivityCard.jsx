import "./DashboardCards.css";

const ActivityCard = ({

    title,

    activities = []

}) => {

    return (

        <div className="activity-card">

            <h3>

                {title}

            </h3>

            {

                activities.length === 0 ?

                (

                    <p>

                        No recent activity available.

                    </p>

                )

                :

                (

                    <ul>

                        {

                            activities.map(

                                (

                                    item,

                                    index

                                ) => (

                                    <li

                                        key={index}

                                    >

                                        {item}

                                    </li>

                                )

                            )

                        }

                    </ul>

                )

            }

        </div>

    );

};

export default ActivityCard;