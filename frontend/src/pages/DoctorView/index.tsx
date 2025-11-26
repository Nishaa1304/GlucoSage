import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import PatientCard from '../../components/PatientCard';
import Loader from '../../components/Loader';
import { getAllPatients, getHighRiskPatients, PatientSummary } from '../../features/doctorView/doctorService';

const DoctorView = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [filter, setFilter] = useState<'all' | 'high-risk'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [filter]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = filter === 'high-risk' 
        ? await getHighRiskPatients()
        : await getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="large" text="Loading patient data..." />
      </div>
    );
  }

  const totalAlerts = patients.reduce((sum, p) => sum + p.highAlerts, 0);
  const avgSugar = Math.round(patients.reduce((sum, p) => sum + p.avgSugar, 0) / patients.length);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <PageHeader 
        title="Doctor Dashboard" 
        subtitle="Patient monitoring & analytics"
        showBack={true}
        action={{
          label: 'Back to Home',
          onClick: () => navigate('/'),
        }}
      />

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{patients.length}</p>
            <p className="text-sm text-gray-600 mt-1">Total Patients</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-orange-600">{totalAlerts}</p>
            <p className="text-sm text-gray-600 mt-1">High Alerts</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{avgSugar}</p>
            <p className="text-sm text-gray-600 mt-1">Avg Sugar</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setFilter('high-risk')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              filter === 'high-risk'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300'
            }`}
          >
            High Risk
          </button>
        </div>

        {/* Patient List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {filter === 'high-risk' ? 'High Risk Patients' : 'All Patients'}
          </h3>

          {patients.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-6xl mb-4">👥</p>
              <p className="text-gray-600">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <PatientCard 
                  key={patient.id}
                  patient={patient}
                  onClick={() => console.log('View patient:', patient.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium">
              📊 View Analytics Report
            </button>
            <button className="w-full bg-green-50 text-green-700 py-3 rounded-lg hover:bg-green-100 transition-colors font-medium">
              📝 Create New Prescription
            </button>
            <button className="w-full bg-purple-50 text-purple-700 py-3 rounded-lg hover:bg-purple-100 transition-colors font-medium">
              👥 Add New Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorView;
