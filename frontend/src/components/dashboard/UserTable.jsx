function UserTable({ users }) {

    return (

        <table className="user-table">

            <thead>

                <tr>

                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Experience</th>

                </tr>

            </thead>

            <tbody>

                {users.map(user => (

                    <tr key={user.id}>

                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.experience}</td>

                    </tr>

                ))}

            </tbody>

        </table>

    );

}

export default UserTable;