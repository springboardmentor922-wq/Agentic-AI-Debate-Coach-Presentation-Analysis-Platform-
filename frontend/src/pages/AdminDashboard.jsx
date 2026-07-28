export default function AdminDashboard() {

    const username = localStorage.getItem("username");

    return (
        <div>

            <h1>Admin Dashboard</h1>

            <h2>Welcome, {username}</h2>

            <p>Role : Admin</p>

        </div>
    );
}