import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

const MainLayout = ({ children }) => {
    return (
        <div className="app-shell">
            <Sidebar />

            <div className="app-main">
                <Navbar />
                <main className="app-content">{children}</main>
            </div>
        </div>
    );
};

export default MainLayout;