import AdminSidebar from "./AdminSidebar";
import Navbar from "./Navbar";

import "../styles/adminDashboard.css";

function AdminLayout({ children }) {

    return (

        <div className="admin-layout">

            <AdminSidebar />

            <div className="admin-main">

                <Navbar />

                <main className="admin-content">

                    {children}

                </main>

            </div>

        </div>

    );

}

export default AdminLayout;