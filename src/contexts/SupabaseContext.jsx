import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import supabase, { timeEntriesService, clientsService, employeesService } from '../services/supabaseService';

// Create the Supabase Context
export const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize Supabase connection and check status
  useEffect(() => {
    const checkConnection = async () => {
      if (!supabase) {
        console.warn('Supabase client not available.');
        setError('Supabase client not available. Using local storage as fallback.');
        setInitialized(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if we can connect to Supabase
        const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        setInitialized(true);
        console.log('Supabase connection established');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError('Failed to connect to database. Using local storage as fallback.');
        setInitialized(false);
      } finally {
        setLoading(false);
      }
    };
    
    // Only try to connect if Supabase URL and key are properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && 
        supabaseUrl !== 'https://placeholder.supabase.co' && 
        supabaseKey !== 'placeholder-key') {
      checkConnection();
    } else {
      console.warn('Supabase credentials missing or invalid.');
      setError('Supabase credentials missing or invalid. Using local storage as fallback.');
      setInitialized(false);
      setLoading(false);
    }
  }, []);
  
  // Sync user data with Supabase if initialized and user is logged in
  useEffect(() => {
    const syncUserData = async () => {
      if (!initialized || !currentUser || !supabase) return;
      
      try {
        // Check if user exists in our users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error('Error checking user:', error);
          return;
        }
        
        // If user doesn't exist in our table, create them
        if (!data) {
          await supabase.from('users').insert([{
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role || 'employee',
            avatar_url: currentUser.avatar
          }]);
        }
      } catch (err) {
        console.error('Error syncing user data with Supabase:', err);
      }
    };
    
    syncUserData();
  }, [initialized, currentUser]);
  
  // Function to determine if we're using Supabase or localStorage
  const isUsingSupabase = () => {
    return initialized && !error;
  };
  
  // Time tracking functions
  const getTimeEntries = async (userId, monthYearStr) => {
    if (isUsingSupabase()) {
      return await timeEntriesService.getTimeEntries(userId, monthYearStr);
    } else {
      // Fallback to localStorage
      const savedEntries = localStorage.getItem(`timeEntries-${userId}-${monthYearStr}`);
      return savedEntries ? JSON.parse(savedEntries) : [];
    }
  };
  
  const getAllTimeEntries = async (monthYearStr = null, clientId = null, userId = null) => {
    if (isUsingSupabase()) {
      return await timeEntriesService.getAllTimeEntries(monthYearStr, clientId, userId);
    } else {
      // Fallback to localStorage
      const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
      
      // Apply filters if provided
      return allEntries.filter(entry => {
        let include = true;
        if (monthYearStr) include = include && entry.date.startsWith(monthYearStr);
        if (clientId) include = include && entry.clientId === clientId;
        if (userId) include = include && entry.userId === userId;
        return include;
      });
    }
  };
  
  const addTimeEntry = async (entry) => {
    if (isUsingSupabase()) {
      return await timeEntriesService.addTimeEntry(entry);
    } else {
      // Fallback to localStorage
      const id = Date.now().toString();
      const newEntry = { ...entry, id };
      
      // Add to user's entries
      const monthYearStr = entry.date.substring(0, 7); // YYYY-MM
      const savedEntries = localStorage.getItem(`timeEntries-${entry.userId}-${monthYearStr}`);
      const entries = savedEntries ? JSON.parse(savedEntries) : [];
      entries.push(newEntry);
      localStorage.setItem(`timeEntries-${entry.userId}-${monthYearStr}`, JSON.stringify(entries));
      
      // Add to global entries for admin reporting
      const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
      allEntries.push(newEntry);
      localStorage.setItem('allTimeEntries', JSON.stringify(allEntries));
      
      return newEntry;
    }
  };
  
  const updateTimeEntry = async (id, updates) => {
    if (isUsingSupabase()) {
      return await timeEntriesService.updateTimeEntry(id, updates);
    } else {
      // Fallback to localStorage
      // This is more complex as we need to update in multiple places, simplified for now
      const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
      const entryIndex = allEntries.findIndex(e => e.id === id);
      
      if (entryIndex === -1) return false;
      
      // Update in global entries
      const updatedEntry = { ...allEntries[entryIndex], ...updates };
      allEntries[entryIndex] = updatedEntry;
      localStorage.setItem('allTimeEntries', JSON.stringify(allEntries));
      
      // Also update in user's entries
      const userId = updatedEntry.userId;
      const monthYearStr = updatedEntry.date.substring(0, 7);
      const userEntries = JSON.parse(localStorage.getItem(`timeEntries-${userId}-${monthYearStr}`) || '[]');
      const userEntryIndex = userEntries.findIndex(e => e.id === id);
      
      if (userEntryIndex !== -1) {
        userEntries[userEntryIndex] = updatedEntry;
        localStorage.setItem(`timeEntries-${userId}-${monthYearStr}`, JSON.stringify(userEntries));
      }
      
      return true;
    }
  };
  
  const deleteTimeEntry = async (id) => {
    if (isUsingSupabase()) {
      return await timeEntriesService.deleteTimeEntry(id);
    } else {
      // Fallback to localStorage
      // Find the entry first to get userId and date
      const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
      const entryIndex = allEntries.findIndex(e => e.id === id);
      
      if (entryIndex === -1) return false;
      
      // Extract info needed to update user's entries
      const { userId, date } = allEntries[entryIndex];
      const monthYearStr = date.substring(0, 7);
      
      // Remove from global entries
      allEntries.splice(entryIndex, 1);
      localStorage.setItem('allTimeEntries', JSON.stringify(allEntries));
      
      // Remove from user's entries
      const userEntries = JSON.parse(localStorage.getItem(`timeEntries-${userId}-${monthYearStr}`) || '[]');
      const userEntryIndex = userEntries.findIndex(e => e.id === id);
      
      if (userEntryIndex !== -1) {
        userEntries.splice(userEntryIndex, 1);
        localStorage.setItem(`timeEntries-${userId}-${monthYearStr}`, JSON.stringify(userEntries));
      }
      
      return true;
    }
  };
  
  const saveTimeEntries = async (entries, userId, monthYearStr) => {
    if (isUsingSupabase()) {
      return await timeEntriesService.saveTimeEntries(entries, userId, monthYearStr);
    } else {
      // Fallback to localStorage
      localStorage.setItem(`timeEntries-${userId}-${monthYearStr}`, JSON.stringify(entries));
      
      // Also update allTimeEntries
      const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
      
      // Remove existing entries for this user and month
      const filteredEntries = allEntries.filter(entry => 
        !(entry.userId === userId && entry.date.startsWith(monthYearStr))
      );
      
      // Add the new/updated entries
      const updatedAllEntries = [...filteredEntries, ...entries];
      localStorage.setItem('allTimeEntries', JSON.stringify(updatedAllEntries));
      
      return true;
    }
  };
  
  // Clients functions
  const getClients = async () => {
    if (isUsingSupabase()) {
      return await clientsService.getClients();
    } else {
      // Fallback to localStorage
      const savedClients = localStorage.getItem('clients');
      return savedClients ? JSON.parse(savedClients) : [];
    }
  };
  
  const getClientById = async (id) => {
    if (isUsingSupabase()) {
      return await clientsService.getClientById(id);
    } else {
      // Fallback to localStorage
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      return clients.find(client => client.id === id) || null;
    }
  };
  
  // Create context value object
  const contextValue = {
    initialized,
    loading,
    error,
    isUsingSupabase,
    // Time entries functions
    getTimeEntries,
    getAllTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    saveTimeEntries,
    // Clients functions
    getClients,
    getClientById,
    // Add more functions as needed
  };
  
  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

export default SupabaseProvider;