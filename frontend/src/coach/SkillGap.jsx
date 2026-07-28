import DashboardLayout from "../layouts/DashboardLayout";

export default function SkillGap() {

    return (

        <DashboardLayout>

            <h1>Skill Gap Analysis</h1>

            <hr />

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
                        padding: "20px",
                        borderRadius: "10px"
                    }}
                >
                    <h3>Confidence</h3>
                    <p>85%</p>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        padding: "20px",
                        borderRadius: "10px"
                    }}
                >
                    <h3>Communication</h3>
                    <p>80%</p>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        padding: "20px",
                        borderRadius: "10px"
                    }}
                >
                    <h3>Critical Thinking</h3>
                    <p>75%</p>
                </div>

                <div
                    style={{
                        border: "1px solid gray",
                        padding: "20px",
                        borderRadius: "10px"
                    }}
                >
                    <h3>Rebuttal Skills</h3>
                    <p>70%</p>
                </div>

            </div>

        </DashboardLayout>

    );

}