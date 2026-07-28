export default function EducatorDashboard() {

    const username = localStorage.getItem("username");

    return (
        <div>

            <h1>Educator Dashboard</h1>

            <h2>Welcome, {username}</h2>

            <p>Role : Educator</p>

        </div>
    );
}