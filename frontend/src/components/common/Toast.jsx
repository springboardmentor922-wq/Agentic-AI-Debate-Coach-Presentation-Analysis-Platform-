import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from "react-icons/fa";
import "./Toast.css";

const Toast = ({ toasts, onClose }) => {
    if (!toasts || toasts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <FaCheckCircle className="toast-icon success" />;
            case "error":
                return <FaTimesCircle className="toast-icon error" />;
            case "warning":
                return <FaExclamationCircle className="toast-icon warning" />;
            default:
                return <FaInfoCircle className="toast-icon info" />;
        }
    };

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-card ${toast.type}`}>
                    {getIcon(toast.type)}
                    <span className="toast-message">{toast.message}</span>
                    <button type="button" className="toast-close" onClick={() => onClose(toast.id)}>
                        <FaTimes />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toast;
