import { useState, useContext } from "react";
import { SupabaseContext } from "../../../contexts/SupabaseContext";

export default function TimeEntryForm() {
  const { user, supabase } = useContext(SupabaseContext);

  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, isError = false) => {
    setToastMessage({ msg, isError });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const submitToGoogleSheet = async (entry) => {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxqN07fYcTqgPT3dPTtEMWbbJS6T87sHTLhQ3M638TfaF4pN0OzQzlg1ZDZyhd-qh2C/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });
    const result = await response.json();
    return result;
  };

  const submitToSupabase = async (entry) => {
    const { error } = await supabase.from("time_entries").insert(entry);
    if (error) throw error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const entry = {
      email: user.email,
      client,
      date,
      hours: parseFloat(hours),
      notes,
    };

    try {
      await submitToGoogleSheet(entry);
      showToast("Submitted to Google Sheets ✅");
    } catch (err) {
      console.warn("Google Sheets failed, falling back to Supabase", err);
      try {
        await submitToSupabase(entry);
        showToast("Google failed, submitted to Supabase ✅");
      } catch (fallbackErr) {
        console.error("Supabase submission also failed", fallbackErr);
        showToast("Submission failed ❌", true);
      }
    }

    // Reset form
    setClient(""); setDate(""); setHours(""); setNotes("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold">Submit Hours</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={client} onChange={(e) => setClient(e.target.value)} className="input" placeholder="Client" required />
        <input value={date} onChange={(e) => setDate(e.target.value)} className="input" type="date" required />
        <input value={hours} onChange={(e) => setHours(e.target.value)} className="input" type="number" step="0.1" placeholder="Hours" required />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Notes" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>

      {toastMessage && (
        <div className={`mt-4 p-3 rounded ${toastMessage.isError ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
          {toastMessage.msg}
        </div>
      )}
    </div>
  );
}
