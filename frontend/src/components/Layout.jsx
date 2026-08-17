import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AIChatbot from "./common/AIChatbot";

import "../styles/layout.css";

function Layout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="layout-right">

        <Navbar />

        <main className="layout-content">
          {children}
        </main>

      </div>

      {/* Global AI Coach */}
      <AIChatbot />

    </div>
  );
}

export default Layout;