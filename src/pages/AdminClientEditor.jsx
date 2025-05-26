import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const CLIENT_API = import.meta.env.VITE_ADVISOR_TIME_API + '?type=clients';

const AdminClientEditor = () => {
const { currentUser, idToken } = useContext(AuthContext);
const isAdmin = currentUser?.email === 'accounting@blackhaysgroup.com';

const [clients, setClients] = useState([]);
const [newClient, setNewClient] = useState({ name: '', status: 'active' });
const [loading, setLoading] = useState(true);

useEffect(() => {
const loadClients = async () => {
try {
const res = await fetch(CLIENT_API);
const data = await res.json();
setClients(data);
} catch (err) {
console.error('Failed to load clients:', err);
} finally {
setLoading(false);
}
};

scss
Copy
Edit
