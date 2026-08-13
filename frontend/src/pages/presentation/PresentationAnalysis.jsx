import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AudioRecorder from "../../components/presentation/AudioRecorder";
import presentationService from "../../services/presentationService";
import { FaHistory, FaMusic, FaClock, FaCheckCircle, FaFileAudio, FaChartBar } from "react-icons/fa";
import "./PresentationAnalysis.css";

const PresentationAnalysis = () => {
    const navigate = useNavigate();
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchRecordings = async () => {
        try {
            setLoading(true);
            const res = await presentationService.getRecordings();
            if (res.success) {
                setRecordings(res.data || []);
            }
        } catch (err) {
            console.error("Failed to load recordings:", err);
            setError("Could not load previous presentation recordings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecordings();
    }, []);

    const handleUploadSuccess = async (formData) => {
        await presentationService.uploadRecording(formData);
        fetchRecordings();
    };

    return (
        <div className="presentation-page-container">
            <div className="presentation-page-header">
                <h2>Presentation Analysis & Recording Studio</h2>
                <p>
                    Record your public speech or presentation. Audio binaries are stored in MongoDB GridFS,
                    enabling presentation analytics, speech-to-text, and coaching feedback.
                </p>
            </div>

            {/* Recorder Section */}
            <div className="presentation-recorder-section">
                <AudioRecorder onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Previous Recordings Section */}
            <div className="presentation-history-section">
                <div className="history-header">
                    <h3><FaHistory /> My Presentation Recordings</h3>
                    <span className="count-badge">{recordings.length} Submissions</span>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading presentation history...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : recordings.length === 0 ? (
                    <div className="empty-history-state">
                        <FaFileAudio className="empty-icon" />
                        <p>No presentation recordings submitted yet.</p>
                        <span>Use the recorder above to submit your first presentation speech.</span>
                    </div>
                ) : (
                    <div className="recordings-grid">
                        {recordings.map((rec) => (
                            <div key={rec.id} className="recording-card">
                                <div className="card-header">
                                    <span className="title">{rec.title || "Untitled Presentation"}</span>
                                    <span className={`status-pill status-${rec.processing_status.toLowerCase()}`}>
                                        <FaCheckCircle className="pill-icon" /> {rec.processing_status}
                                    </span>
                                </div>
                                <div className="card-meta">
                                    <span><FaMusic /> {rec.filename || "audio.webm"}</span>
                                    <span><FaClock /> {new Date(rec.created_at).toLocaleDateString()} {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="card-player">
                                    <audio controls src={presentationService.getAudioStreamUrl(rec.id)} className="history-audio-player"></audio>
                                </div>
                                <div className="card-actions" style={{ marginTop: "0.75rem" }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        style={{ width: "100%", justifyContent: "center" }}
                                        onClick={() => navigate(`/presentation-reports/${rec.id}`)}
                                    >
                                        <FaChartBar /> View Performance Report
                                    </button>
                                </div>
                            </div>

                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PresentationAnalysis;
