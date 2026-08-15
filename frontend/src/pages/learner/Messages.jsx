import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Spinner from "../../components/common/Spinner";
import { getMyMessages } from "../../services/dashboardService";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMyMessages();
        setMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        💬 My Messages
      </h1>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6">
          No messages found.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.message_id}
              className="bg-white rounded-xl shadow p-5"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">
                  📩 Coach Request
                </h3>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    message.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {message.status}
                </span>
              </div>

              <p className="mt-3 text-gray-700">
                {message.message}
              </p>
              {message.reply && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                  <p className="font-semibold text-green-700">
                    👨‍🏫 Coach Reply
                  </p>

                  <p className="mt-1 text-gray-700">
                    {message.reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Messages;