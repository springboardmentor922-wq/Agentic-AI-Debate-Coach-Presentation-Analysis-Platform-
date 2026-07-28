import DashboardLayout from "../layouts/DashboardLayout";

export default function StudentRankings() {
    return (
        <DashboardLayout>

            <h1>Student Rankings</h1>

            <hr />

            <br />

            <table
                border="1"
                style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}
            >
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Average Score</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>1</td>
                        <td>Rahul</td>
                        <td>91%</td>
                    </tr>

                    <tr>
                        <td>2</td>
                        <td>Poojitha</td>
                        <td>88%</td>
                    </tr>

                    <tr>
                        <td>3</td>
                        <td>Priya</td>
                        <td>84%</td>
                    </tr>

                    <tr>
                        <td>4</td>
                        <td>Arjun</td>
                        <td>82%</td>
                    </tr>
                </tbody>

            </table>

        </DashboardLayout>
    );
}