function DashboardCard({ title, value, color = "primary", children }) {
    return (
        <div className={`card shadow border-0 h-100`}>
            <div className={`card-header bg-${color} text-white`}>
                <h5 className="mb-0">{title}</h5>
            </div>

            <div className="card-body">

                {value && (
                    <h2 className="fw-bold text-center">
                        {value}
                    </h2>
                )}

                {children}

            </div>
        </div>
    );
}

export default DashboardCard;