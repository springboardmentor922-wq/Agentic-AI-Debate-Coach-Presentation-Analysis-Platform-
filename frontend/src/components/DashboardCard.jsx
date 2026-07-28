import "./DashboardCard.css";

export default function DashboardCard({
    title,
    value,
    subtitle,
    icon,
    color = "#3b82f6",
}) {
    return (
        <div className="dashboard-card">

            <div className="dashboard-card-header">

                <h3>{title}</h3>

                <div className="dashboard-icon"
                style={{
                    background: color
                }}
                >
                    {icon}
                </div>

            </div>

            <h1>{value}</h1>

            <p>{subtitle}</p>

        </div>
    );
}