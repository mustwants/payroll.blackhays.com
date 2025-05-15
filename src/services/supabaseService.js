import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are available
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Please connect to Supabase to enable database functionality.');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder-key');

// Time entries service functions
export const timeEntriesService = {
  /**
   * Get time entries for a specific user and month
   * @param {string} userId - The user ID
   * @param {string} monthYearStr - The month/year in format 'YYYY-MM'
   */
  async getTimeEntries(userId, monthYearStr) {
    if (!userId || !monthYearStr) return [];
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .like('date', `${monthYearStr}%`)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching time entries:', error.message);
      return [];
    }
  },
  
  /**
   * Get all time entries (for admin reports)
   * @param {string} monthYearStr - Optional month/year filter in format 'YYYY-MM'
   * @param {string} clientId - Optional client ID filter
   * @param {string} userId - Optional user ID filter
   */
  async getAllTimeEntries(monthYearStr = null, clientId = null, userId = null) {
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false });
        
      // Apply filters if provided
      if (monthYearStr) {
        query = query.like('date', `${monthYearStr}%`);
      }
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all time entries:', error.message);
      return [];
    }
  },
  
  /**
   * Add a new time entry
   * @param {Object} entry - The time entry to add
   */
  async addTimeEntry(entry) {
    if (!entry) return null;
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([
          {
            user_id: entry.userId,
            user_name: entry.userName,
            client_id: entry.clientId,
            client_name: entry.clientName,
            date: entry.date,
            hours: parseFloat(entry.hours),
            notes: entry.notes || ''
          }
        ])
        .select();
        
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding time entry:', error.message);
      return null;
    }
  },
  
  /**
   * Update an existing time entry
   * @param {string} id - The entry ID to update
   * @param {Object} updates - The fields to update
   */
  async updateTimeEntry(id, updates) {
    if (!id || !updates) return false;
    
    try {
      // Build update object
      const updateData = {};
      
      if (updates.clientId) updateData.client_id = updates.clientId;
      if (updates.clientName) updateData.client_name = updates.clientName;
      if (updates.date) updateData.date = updates.date;
      if (updates.hours) updateData.hours = parseFloat(updates.hours);
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      const { error } = await supabase
        .from('time_entries')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating time entry:', error.message);
      return false;
    }
  },
  
  /**
   * Delete a time entry
   * @param {string} id - The entry ID to delete
   */
  async deleteTimeEntry(id) {
    if (!id) return false;
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting time entry:', error.message);
      return false;
    }
  },
  
  /**
   * Bulk save/update time entries
   * @param {Array} entries - Array of time entries to save
   * @param {string} userId - User ID to associate with entries
   * @param {string} monthYearStr - The month/year these entries belong to
   */
  async saveTimeEntries(entries, userId, monthYearStr) {
    if (!entries || !entries.length || !userId || !monthYearStr) return false;
    
    try {
      // First get existing entries for this user & month
      const { data: existingEntries, error: fetchError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('user_id', userId)
        .like('date', `${monthYearStr}%`);
        
      if (fetchError) throw fetchError;
      
      // Extract IDs from entries that have them (existing ones)
      const entriesWithIds = entries.filter(e => e.serverId);
      const entryIds = entriesWithIds.map(e => e.serverId);
      
      // Find entries to delete (in DB but not in our current list)
      const idsToDelete = existingEntries
        .map(e => e.id)
        .filter(id => !entryIds.includes(id));
      
      // Begin a transaction (not supported in Supabase JS client, so we'll do these operations sequentially)
      
      // 1. Delete entries that should be removed
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('time_entries')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
      }
      
      // 2. Update existing entries
      for (const entry of entriesWithIds) {
        await this.updateTimeEntry(entry.serverId, entry);
      }
      
      // 3. Add new entries (those without server IDs)
      const newEntries = entries.filter(e => !e.serverId);
      
      if (newEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('time_entries')
          .insert(
            newEntries.map(entry => ({
              user_id: entry.userId,
              user_name: entry.userName,
              client_id: entry.clientId,
              client_name: entry.clientName,
              date: entry.date,
              hours: parseFloat(entry.hours),
              notes: entry.notes || ''
            }))
          );
          
        if (insertError) throw insertError;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving time entries:', error.message);
      return false;
    }
  }
};

// Client service functions
export const clientsService = {
  /**
   * Get all clients
   */
  async getClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error.message);
      return [];
    }
  },
  
  /**
   * Get a specific client by ID
   * @param {string} id - The client ID
   */
  async getClientById(id) {
    if (!id) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client:', error.message);
      return null;
    }
  },
  
  /**
   * Add a new client
   * @param {Object} client - The client to add
   */
  async addClient(client) {
    if (!client) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select();
        
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding client:', error.message);
      return null;
    }
  },
  
  /**
   * Update an existing client
   * @param {string} id - The client ID to update
   * @param {Object} updates - The client updates
   */
  async updateClient(id, updates) {
    if (!id || !updates) return false;
    
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating client:', error.message);
      return false;
    }
  },
  
  /**
   * Delete a client
   * @param {string} id - The client ID to delete
   */
  async deleteClient(id) {
    if (!id) return false;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting client:', error.message);
      return false;
    }
  }
};

// Employee service functions
export const employeesService = {
  /**
   * Get all employees
   */
  async getEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error.message);
      return [];
    }
  },
  
  /**
   * Get a specific employee by ID
   * @param {string} id - The employee ID
   */
  async getEmployeeById(id) {
    if (!id) return null;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching employee:', error.message);
      return null;
    }
  },
  
  /**
   * Add a new employee
   * @param {Object} employee - The employee to add
   */
  async addEmployee(employee) {
    if (!employee) return null;
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select();
        
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding employee:', error.message);
      return null;
    }
  },
  
  /**
   * Update an existing employee
   * @param {string} id - The employee ID to update
   * @param {Object} updates - The employee updates
   */
  async updateEmployee(id, updates) {
    if (!id || !updates) return false;
    
    try {
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating employee:', error.message);
      return false;
    }
  },
  
  /**
   * Delete an employee
   * @param {string} id - The employee ID to delete
   */
  async deleteEmployee(id) {
    if (!id) return false;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error.message);
      return false;
    }
  }
};

export default supabase;