import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const SubmitHours = () => {
  const { currentUser, idToken } = useContext(AuthContext);
  const [form, setForm] = useState({ date: '', client: '', hours: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_ADVISOR_TIME_API}?type=times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: currentUser.email, ...form }),
      });
      const result = await res.json();
      alert('Time entry submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Error submitting time entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <input type="date" name="date" value={form.date} onChange={handleChange} required />
      <input type="text" name="client" placeholder="Client Name" value={form.client} onChange={handleChange} required />
      <input type="number" name="hours" placeholder="Hours" step="0.1" value={form.hours} onChange={handleChange} required />
      <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Hours'}
      </Button>
    </form>
  );
};

export default SubmitHours;
