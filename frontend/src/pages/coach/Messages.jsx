import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCoachMessages } from "../../services/dashboardService";

function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getCoachMessages();
      setMessages(data);
    };

    fetchMessages();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        📩 Learner Messages
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        {messages.length === 0 ? (
          <p>No messages available.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.message_id}
                className="border rounded-lg p-4"
              >
                <p className="font-semibold">
                  👨‍🎓 Student Request
                </p>

                <p className="mt-2">
                  {message.message}
                </p>

                <span className="text-sm text-gray-500">
                  Status: {message.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Messages;