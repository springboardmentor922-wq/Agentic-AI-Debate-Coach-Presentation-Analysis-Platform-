import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MainLayout = ({ children }) => {

    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#F8FAFC"
            }}
        >

            {/* ======================================
                    Sidebar
            ======================================= */}

            <Sidebar />

            {/* ======================================
                    Main Content
            ======================================= */}

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: "260px",
                    minHeight: "100vh"
                }}
            >

                {/* ======================================
                        Top Navigation
                ======================================= */}

                <Navbar />

                {/* ======================================
                        Page Content
                ======================================= */}

                <main
                    style={{
                        flex: 1,
                        padding: "32px",
                        marginTop: "75px",
                        overflowY: "auto"
                    }}
                >

                    {children}

                </main>

            </div>

        </div>

    );

};

export default MainLayout;