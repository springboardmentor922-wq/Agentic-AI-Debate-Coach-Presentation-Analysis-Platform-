import { useEffect, useState } from "react";

import AppShell from "../layouts/AppShell";

import {
    getPresentationHistory
} from "../services/presentationService";

function PresentationHistory() {

    const [history, setHistory] = useState([]);

    useEffect(() => {

        load();

    }, []);

    async function load() {

        const data = await getPresentationHistory();

        setHistory(data);

    }

    return (

        <AppShell>

            <h1>Presentation History</h1>

            <br />

            {

                history.length === 0 &&

                <p>No presentations analyzed.</p>

            }

            {

                history.map((item, index) => (

                    <div
                        key={index}
                        className="panel"
                        style={{ marginBottom: "20px" }}
                    >

                        <h2>

                            Score

                            {" "}

                            {item.overall_score}/100

                        </h2>

                        <p>

                            Confidence :

                            {" "}

                            {item.confidence}

                        </p>

                        <p>

                            Clarity :

                            {" "}

                            {item.clarity}

                        </p>

                        <p>

                            Speed :

                            {" "}

                            {item.speaking_speed}

                        </p>

                    </div>

                ))

            }

        </AppShell>

    );

}

export default PresentationHistory;