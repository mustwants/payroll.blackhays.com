const submitToGoogleSheet = async (entry) => {
  const response = await fetch("https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  });
  const result = await response.json();
  return result;
};

// Inside handleSubmit()
const entry = {
  email: user.email,
  client,
  date,
  hours,
  notes,
};
await submitToGoogleSheet(entry);
