const submitToGoogleSheet = async (entry) => {
  const response = await fetch("https://script.google.com/macros/s/AKfycbxqN07fYcTqgPT3dPTtEMWbbJS6T87sHTLhQ3M638TfaF4pN0OzQzlg1ZDZyhd-qh2C/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  });
  const result = await response.json();
  return result;
};

// 🧠 Example usage inside form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  const entry = {
    email: user.email,
    client,
    date,
    hours,
    notes,
  };

  try {
    const result = await submitToGoogleSheet(entry);
    alert("Submitted successfully!");
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    alert("Submission failed.");
  }
};