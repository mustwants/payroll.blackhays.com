const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const authenticateBlackhaysUser = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=authenticate`, {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
};
