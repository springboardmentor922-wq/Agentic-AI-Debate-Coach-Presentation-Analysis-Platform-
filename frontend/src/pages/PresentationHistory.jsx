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

        try {

            const data = await getPresentationHistory();

            setHistory(data);

        }

        catch (error) {

            console.log(error);

        }

    }

    return (

        <AppShell>

            <h1>

                📂 Presentation History

            </h1>

            <br />

            {

                history.length === 0 ?

                    (

                        <div className="panel">

                            <h2>

                                No Presentation History

                            </h2>

                        </div>

                    )

                    :

                    history.map((item, index) => (

                        <div

                            className="panel"

                            key={index}

                            style={{ marginBottom: "20px" }}

                        >

                            <h2>

                                Overall Score

                                {" "}

                                {item.overall_score}/100

                            </h2>

                            <br />

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

                                Speaking Speed :

                                {" "}

                                {item.speaking_speed}

                            </p>

                            <br />

                            <strong>

                                AI Feedback

                            </strong>

                            <p>

                                {item.feedback}

                            </p>

                        </div>

                    ))

            }

        </AppShell>

    );

}

export default PresentationHistory;