import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AdvisorProfile from '../components/AdvisorProfile';
import { fetchTimeEntries, fetchAdvisorProfile } from '../utils/timeEntries';
import { exportCSV } from '../utils/exportCSV';

const TeamMemberDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { currentUser, idToken } = useContext(AuthContext);
  const isAdmin = currentUser?.email === 'accounting@blackhaysgroup.com';

  // Ensure advisor email is valid
  const advisorEmail = decodeURIComponent(employeeId || '').trim();

  const [activeTab, setActiveTab] = useState('google');
  const [timeEntries, setTimeEntries] = useState([]);
  const [advisorInfo, setAdvisorInfo] = useState({});
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const data = await fetchAdvisorProfile(advisorEmail, idToken);
        setAdvisorInfo(data || {});
      } catch (err) {
        console.error('Failed to load advisor profile:', err);
        setAdvisorInfo({});
      } finally {
        setLoadingProfile(false);
      }
    };
    if (idToken) loadProfile();
  }, [advisorEmail, idToken]);

  useEffect(() => {
    const loadTimeLogs = async () => {
      setLoadingEntries(true);
      try {
        const logs = await fetchTimeEntries(advisorEmail, idToken);
        setTimeEntries(logs);
      } catch (err) {
        console.error('Failed to load time logs:', err);
      } finally {
        setLoadingEntries(false);
      }
    };
    if (activeTab === 'times' && idToken) loadTimeLogs();
  }, [activeTab, advisorEmail, idToken]);

  const handleExport = () => {
    exportCSV(`${advisorEmail}_time_entries.csv`, timeEntries);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button variant={activeTab === 'google' ? 'primary' : 'outline'} onClick={() => setActiveTab('google')} className="mr-2">
          Google Sheet Info
        </Button>
        <Button variant={activeTab === 'times' ? 'primary' : 'outline'} onClick={() => setActiveTab('times')} className="mr-2">
          Time Entries
        </Button>
        {isAdmin && activeTab === 'times' && (
          <Button variant="outline" onClick={handleExport} className="inline-flex items-center">
            <FiDownload className="mr-2" /> Export CSV
          </Button>
        )}
      </div>

      {activeTab === 'google' && (
        <Card title="Advisor Profile from Google Workspace">
          <div className="p-4">
            {loadingProfile ? (
              <p>Loading...</p>
            ) : advisorInfo?.Email ? (
              <AdvisorProfile userEmail={advisorInfo.Email} isAdmin={isAdmin} />
            ) : (
              <p>Advisor not found.</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'times' && (
        <Card title="Recent Time Logs">
          <div className="p-4">
            {loadingEntries ? (
              <p>Loading...</p>
            ) : timeEntries.length === 0 ? (
              <p>No time entries found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b p-2">Date</th>
                    <th className="border-b p-2">Client</th>
                    <th className="border-b p-2">Hours</th>
                    <th className="border-b p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="border-b p-2">{entry.Date}</td>
                      <td className="border-b p-2">{entry.Client}</td>
                      <td className="border-b p-2">{entry.Hours}</td>
                      <td className="border-b p-2">{entry.Notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      <Button
        variant="outline"
        onClick={() => navigate('/employees')}
        className="mt-6 flex items-center"
      >
        <FiArrowLeft className="mr-2" /> Back to Employees
      </Button>
    </div>
  );
};

export default TeamMemberDetail;

