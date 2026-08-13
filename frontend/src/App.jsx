import AppRoutes from "./routes/AppRoutes";
import AICoachWidget from "./components/aiCoach/AICoachWidget";
import { ToastProvider } from "./context/ToastContext";

function App() {
    return (
        <ToastProvider>
            <AppRoutes />
            <AICoachWidget />
        </ToastProvider>
    );
}

export default App;