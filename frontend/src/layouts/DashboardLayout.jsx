import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "../styles/sidebar.css";
import "../styles/navbar.css";
import "../styles/main.css";

export default function DashboardLayout({ children }) {

    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f4f7fc"
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column"
                }}
            >

                <Navbar />

                <main
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    {children}

                </main>

            </div>

        </div>

    );

}