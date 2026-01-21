import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js"; // <- correct path

export default function CreateChatRequestModal({ onClose, onCreated, prefillTopic = "" }) {
  const [topic, setTopic] = useState(prefillTopic);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setTopic(prefillTopic), [prefillTopic]);

  const handleSubmit = async () => {
    if (!topic) return alert("Please enter a topic.");
    setLoading(true);

    const { data, error } = await supabase
      .from("chat_requests")
      .insert([{ topic, description }]);

    setLoading(false);
    if (error) return alert(error.message);

    onCreated(data[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Create Chat Request</h2>
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-3"
        />
        <textarea
          placeholder="Describe what you need help with..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

