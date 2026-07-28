import DashboardLayout from "../layouts/DashboardLayout";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const performanceData = [
    {
        debate: "Debate 1",
        score: 75,
    },
    {
        debate: "Debate 2",
        score: 82,
    },
    {
        debate: "Debate 3",
        score: 88,
    },
    {
        debate: "Debate 4",
        score: 91,
    },
];

export default function Performance() {

    return (

        <DashboardLayout>

            <h1>Performance Dashboard</h1>

            <br />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                    gap: "20px",
                    marginBottom: "35px",
                }}
            >

                <div className="card">
                    <h3>Total Debates</h3>
                    <h2>4</h2>
                </div>

                <div className="card">
                    <h3>Average Score</h3>
                    <h2>84%</h2>
                </div>

                <div className="card">
                    <h3>Highest Score</h3>
                    <h2>91%</h2>
                </div>

                <div className="card">
                    <h3>Lowest Score</h3>
                    <h2>75%</h2>
                </div>

            </div>

            <div
                className="card"
                style={{
                    height: "420px",
                }}
            >

                <h2>Performance Trend</h2>

                <ResponsiveContainer
                    width="100%"
                    height="90%"
                >

                    <LineChart data={performanceData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="debate" />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </DashboardLayout>

    );

}