import DashboardLayout from "../layouts/DashboardLayout";

export default function Users() {
    return (
        <DashboardLayout>

            <h1>User Management</h1>

            <hr />

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
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Total Users</h3>
                    <h2>120</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Learners</h3>
                    <h2>90</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Educators</h3>
                    <h2>15</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Debate Coaches</h3>
                    <h2>10</h2>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        borderRadius: "10px",
                        padding: "20px"
                    }}
                >
                    <h3>Admins</h3>
                    <h2>5</h2>
                </div>

            </div>

            <br />

            <input
                type="text"
                placeholder="Search users..."
                style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "20px"
                }}
            />

            <table
                border="1"
                style={{
                    width: "100%",
                    borderCollapse: "collapse"
                }}
            >

                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>
                        <td>Rahul</td>
                        <td>rahul@gmail.com</td>
                        <td>Learner</td>
                        <td>Active</td>
                    </tr>

                    <tr>
                        <td>Poojitha</td>
                        <td>poojitha@gmail.com</td>
                        <td>Learner</td>
                        <td>Active</td>
                    </tr>

                    <tr>
                        <td>Priya</td>
                        <td>priya@gmail.com</td>
                        <td>Educator</td>
                        <td>Active</td>
                    </tr>

                    <tr>
                        <td>Arjun</td>
                        <td>arjun@gmail.com</td>
                        <td>Coach</td>
                        <td>Inactive</td>
                    </tr>

                </tbody>

            </table>

        </DashboardLayout>
    );
}