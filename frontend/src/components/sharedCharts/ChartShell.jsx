const ChartShell = ({ title, description, children }) => {
    return (
        <section className="chart-shell">
            <div className="section-header">
                <div>
                    <h2>{title}</h2>
                    {description && <p>{description}</p>}
                </div>
            </div>
            <div className="chart-shell-body">{children}</div>
        </section>
    );
};

export default ChartShell;
