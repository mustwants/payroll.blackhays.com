import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_ADVISOR_API

export default function AdvisorProfile({ userEmail, isAdmin }) {
  const [advisor, setAdvisor] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetch(`${API_URL}?email=${userEmail}`)
      .then(res => res.json())
      .then(data => {
        setAdvisor(data[0])
        setFormData(data[0])
      })
  }, [userEmail])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async () => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const result = await res.json()
    alert(result.status || result.error)
  }

  if (!advisor) return <p>Loading...</p>

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">{advisor["First name"]} {advisor["Last Name"]}</h2>

      <label>Nickname</label>
      <input name="Nickname" value={formData["Nickname"] || ''} onChange={handleChange} />

      <label>Clients (JSON)</label>
      <textarea name="Clients (JSON)" value={formData["Clients (JSON)"] || ''} onChange={handleChange} />

      <label>Use Custom Rate?</label>
      <input type="checkbox" name="Use Custom Rate?" checked={formData["Use Custom Rate?"] === true} onChange={handleChange} />

      <label>Custom Rate</label>
      <input name="Custom Rate" value={formData["Custom Rate"] || ''} onChange={handleChange} />

      {(isAdmin || formData.Email === userEmail) && (
        <>
          <label>Bank Name</label>
          <input name="Bank Name" value={formData["Bank Name"] || ''} onChange={handleChange} />

          <label>Routing Number</label>
          <input name="Routing Number" value={formData["Routing Number"] || ''} onChange={handleChange} />

          <label>Bank Account</label>
          <input name="Bank Account" value={formData["Bank Account"] || ''} onChange={handleChange} />
        </>
      )}

      <button onClick={handleSubmit}>Save</button>
    </div>
  )
}
