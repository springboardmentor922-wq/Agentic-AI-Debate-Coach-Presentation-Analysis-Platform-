function StatCard({
    title,
    value,
    icon = "✦",
    subtitle = null,
    trend = null
}) {

    return (

        <div className="mentor-stat-card">

            <div className="mentor-stat-top">

                <div className="mentor-stat-icon">
                    {icon}
                </div>

                <div className="mentor-stat-content">

                    <p className="mentor-stat-title">
                        {title}
                    </p>

                    <h2>
                        {value}
                    </h2>

                </div>

            </div>

            {
                trend && (

                    <div className="mentor-stat-trend">

                        <span>
                            ↑ {trend}
                        </span>

                        {
                            subtitle && (
                                <small>
                                    {subtitle}
                                </small>
                            )
                        }

                    </div>

                )
            }

            {
                !trend && subtitle && (

                    <p className="mentor-stat-subtitle">
                        {subtitle}
                    </p>

                )
            }

        </div>

    );

}

export default StatCard;