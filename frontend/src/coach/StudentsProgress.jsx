import DashboardLayout from "../layouts/DashboardLayout";

export default function StudentsProgress() {
    return (
        <DashboardLayout>

            <h1>Student Progress</h1>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                    gap: "20px"
                }}
            >

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Total Students</h3>
                    <h2>25</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Completed Debates</h3>
                    <h2>18</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Average Score</h3>
                    <h2>84%</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Students Improving</h3>
                    <h2>20</h2>
                </div>

            </div>

            <br />

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}
                border="1"
            >

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Debates</th>

                        <th>Average Score</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>Rahul</td>

                        <td>8</td>

                        <td>88%</td>

                        <td>Excellent</td>

                    </tr>

                    <tr>

                        <td>Poojitha</td>

                        <td>6</td>

                        <td>84%</td>

                        <td>Good</td>

                    </tr>

                    <tr>

                        <td>Priya</td>

                        <td>5</td>

                        <td>79%</td>

                        <td>Improving</td>

                    </tr>

                    <tr>

                        <td>Arjun</td>

                        <td>7</td>

                        <td>91%</td>

                        <td>Excellent</td>

                    </tr>

                </tbody>

            </table>

        </DashboardLayout>
    );
}