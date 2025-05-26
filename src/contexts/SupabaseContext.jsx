import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import supabase, { timeEntriesService, clientsService, employeesService } from '../services/supabaseService';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Create the Supabase Context
export const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  
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
        
        // Use a simpler health check with timeout to prevent long hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
          // Use a simple ping query to test connection
          const { data, error: pingError } = await supabase
            .from('company_info')
            .select('id')
            .limit(1)
            .abortSignal(controller.signal);
          
          // Clear the timeout since request completed
          clearTimeout(timeoutId);
          
          if (pingError) {
            throw pingError;
          }
          
          setInitialized(true);
          setRetryCount(0); // Reset retry counter on success
          console.log('Supabase connection established');
        } catch (fetchError) {
          // Clear the timeout if the request failed
          clearTimeout(timeoutId);
          
          // Check if this was a timeout error
          if (fetchError.name === 'AbortError') {
            throw new Error('Connection timed out while connecting to Supabase');
          }
          
          throw fetchError;
        }
      } catch (err) {
        console.error('Supabase connection error:', err);
        
        // Detailed error information
        const errorMessage = err.message || 'Unknown error';
        const errorCode = err.code || 'No error code';
        const statusCode = err.status || 'No status code';
        
        // Check if it's a CORS issue
        let detailedError = `Failed to connect to database (Status: ${statusCode}, Code: ${errorCode}): ${errorMessage}. Using local storage as fallback.`;
        
        if (errorMessage.includes('Failed to fetch') || err.name === 'TypeError') {
          detailedError = `Network error connecting to Supabase. This could be due to CORS issues, incorrect URL, or Supabase server being unavailable. Using local storage as fallback.`;
          console.warn('Possible CORS or network connectivity issue detected');
        }
        
        setError(detailedError);
        
        // Retry logic with exponential backoff
        if (retryCount < MAX_RETRIES) {
          const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Retrying connection in ${backoffTime/1000}s (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
          
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, backoffTime);
        } else {
          console.log('Maximum retry attempts reached. Falling back to local storage.');
          setInitialized(false);
        }
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
      console.warn('Supabase credentials missing or invalid:', {
        urlDefined: !!supabaseUrl,
        keyDefined: !!supabaseKey,
        urlIsPlaceholder: supabaseUrl === 'https://placeholder.supabase.co',
        keyIsPlaceholder: supabaseKey === 'placeholder-key'
      });
      setError('Supabase credentials missing or invalid. Using local storage as fallback.');
      setInitialized(false);
      setLoading(false);
    }
  }, [retryCount]); // Added retryCount as dependency to trigger retries
  
  // Sync user data with Supabase if initialized and user is logged in
  useEffect(() => {
    const syncUserData = async () => {
      if (!initialized || !currentUser || !supabase) return;
      
      try {
        // Ensure user ID is a valid UUID before checking
        const isValidUUID = typeof currentUser.id === 'string' && 
                           /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
        
        if (!isValidUUID) {
          console.error('Invalid UUID format for user ID:', currentUser.id);
          // Generate a valid UUID if the current one is invalid
          const validUUID = uuidv4();
          console.log('Generated valid UUID:', validUUID);
          // We can't modify currentUser directly, so we'll need to use the local user data
          return;
        }
        
        // Check if user exists in our users table - using limit(1) instead of single()
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .limit(1);
          
        if (error) {
          console.error('Error checking user:', error);
          return;
        }
        
        // If user doesn't exist in our table, create them
        if (!data || data.length === 0) {
          // Create a new user object with valid UUID
          const userData = {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            role: currentUser.role || 'employee',
            avatar_url: currentUser.avatar
          };
          
          // Google ID if available
          if (currentUser.google_id) {
            userData.google_id = currentUser.google_id;
          }
          
          // Try inserting with service role if available
          const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
          let insertResult;
          
          if (serviceRoleKey) {
            try {
              // Create a service role client
              const serviceClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                serviceRoleKey
              );
              
              insertResult = await serviceClient
                .from('users')
                .insert([userData])
                .select();
                
              if (insertResult.error) {
                console.error('Error creating user with service role:', insertResult.error);
                throw insertResult.error;
              }
            } catch (serviceError) {
              console.error('Service role client error:', serviceError);
              // Fall back to regular client if service role fails
              insertResult = await supabase
                .from('users')
                .insert([userData])
                .select();
            }
          } else {
            // Try with auth.uid() matching the user ID (which should pass RLS)
            insertResult = await supabase
              .from('users')
              .insert([userData])
              .select();
          }
          
          if (insertResult && insertResult.error) {
            console.error('Error creating user in Supabase:', insertResult.error);
            // Don't throw, just log - allow the app to continue with local storage fallback
          } else {
            console.log('User created or updated in Supabase');
          }
        }
      } catch (err) {
        console.error('Error syncing user data with Supabase:', err);
        // Don't rethrow, let the app continue with local storage
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