export default function LearnerDashboard() {

    const username = localStorage.getItem("username");

    return (
        <div>

            <h1>Learner Dashboard</h1>

            <h2>Welcome, {username}</h2>

            <p>Role : Learner</p>

        </div>
    );
}