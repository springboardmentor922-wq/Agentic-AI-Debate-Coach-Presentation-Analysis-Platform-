import DashboardLayout from "../layouts/DashboardLayout";

export default function Evaluations() {
    return (
        <DashboardLayout>

            <h1>Debate Evaluations</h1>

            <hr />

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}
                border="1"
            >
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Topic</th>
                        <th>Score</th>
                        <th>Feedback</th>
                    </tr>
                </thead>

                <tbody>

                    <tr>
                        <td>Rahul</td>
                        <td>AI in Education</td>
                        <td>90%</td>
                        <td>Excellent communication</td>
                    </tr>

                    <tr>
                        <td>Poojitha</td>
                        <td>Climate Change</td>
                        <td>84%</td>
                        <td>Good confidence</td>
                    </tr>

                    <tr>
                        <td>Priya</td>
                        <td>Online Learning</td>
                        <td>79%</td>
                        <td>Needs stronger rebuttals</td>
                    </tr>

                    <tr>
                        <td>Arjun</td>
                        <td>Artificial Intelligence</td>
                        <td>92%</td>
                        <td>Outstanding performance</td>
                    </tr>

                </tbody>

            </table>

        </DashboardLayout>
    );
}