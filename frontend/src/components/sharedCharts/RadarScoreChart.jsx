import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const RadarScoreChart = ({ data, dataKey = "score", nameKey = "label" }) => {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey={nameKey} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Tooltip />
                <Radar
                    name="Score"
                    dataKey={dataKey}
                    stroke="#2563EB"
                    fill="#8B5CF6"
                    fillOpacity={0.35}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default RadarScoreChart;
