import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import ChatPopup from "./ChatPopup";


function FloatingAICoach() {

    const [open, setOpen] = useState(false);

    const location = useLocation();

    const params = useParams();


    /*
        Current application page.

        Examples:

        /dashboard
        /argument-analyzer
        /fallacy-detector
        /counterargument
        /debate/12
    */

    const page = location.pathname;


    /*
        Extra page context.

        This allows Cortexa to understand
        what part of the platform the user
        is currently using.
    */

    const context = {

        page,

        sessionId: params.id || null

    };


    return (

        <>

            {open && (

                <ChatPopup
                    page={page}
                    context={context}
                />

            )}


            <button

                className="floating-ai"

                onClick={() => setOpen(prev => !prev)}

                title="Ask Cortexa AI Coach"

                aria-label="Open Cortexa AI Coach"

            >

                {open ? "×" : "✦"}

            </button>

        </>

    );

}


export default FloatingAICoach;