import { useState } from "react";

export default function HelpTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMail = (e) => {
    e.preventDefault();
    const to = "syedkfahim@gmail.com";
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-2xl font-bold">Help & Support</h2>

      <form onSubmit={sendMail} className="bg-white rounded shadow p-5 space-y-4">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full border rounded px-3 py-2"
          required
        />

        <textarea
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue"
          className="w-full border rounded px-3 py-2"
          required
        />

        <div className="flex gap-3">
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded">
            Send Email
          </button>
          <a
            href="mailto:ekfahim00@gmail.com"
            className="px-4 py-2 rounded border text-sm"
          >
            Open Mail App
          </a>
        </div>
      </form>

      <p className="text-xs text-gray-500">
        Note: This opens your default mail app. For in-app email sending, we’ll integrate EmailJS or a Cloud Function later.
      </p>
    </div>
  );
}
