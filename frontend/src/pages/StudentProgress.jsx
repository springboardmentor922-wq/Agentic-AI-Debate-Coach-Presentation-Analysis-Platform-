import Layout from "../components/Layout";

function StudentProgress() {

    return (

        <Layout>

            <div className="container">

                <h2>

                    📊 Student Progress

                </h2>

                <table className="table table-striped shadow mt-4">

                    <thead>

                        <tr>

                            <th>Student</th>

                            <th>Average Score</th>

                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr>

                            <td>Archana</td>

                            <td>89</td>

                            <td>Excellent</td>

                        </tr>

                        <tr>

                            <td>Rahul</td>

                            <td>82</td>

                            <td>Good</td>

                        </tr>

                        <tr>

                            <td>Sneha</td>

                            <td>74</td>

                            <td>Average</td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </Layout>

    );

}

export default StudentProgress;