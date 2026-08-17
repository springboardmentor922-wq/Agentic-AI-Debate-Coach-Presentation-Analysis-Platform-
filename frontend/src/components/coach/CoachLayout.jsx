import CoachSidebar from "./CoachSidebar";
import Navbar from "../Navbar";
import AIChatbot from "../common/AIChatbot";

function CoachLayout({ children }) {
    return (
        <div className="coach-layout">

            <CoachSidebar />

            <div className="layout-right">

                <Navbar />

                <main className="layout-content">
                    {children}
                </main>

            </div>

            <AIChatbot />

        </div>
    );
}

export default CoachLayout;