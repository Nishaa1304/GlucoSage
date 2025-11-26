import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GlucoseReading } from '../../features/prediction/mockPredictor';

interface PredictionChartProps {
  data: GlucoseReading[];
  peakValue?: number;
  peakTime?: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data, peakValue, peakTime }) => {
  const chartData = data.map(reading => ({
    time: reading.time,
    value: reading.value,
    zone: reading.zone,
  }));

  const getStrokeColor = (zone: string) => {
    switch (zone) {
      case 'high':
        return '#ef4444';
      case 'moderate':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">📈 Glucose Trend</h3>
      
      <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              domain={[60, 220]}
              tick={{ fill: '#6b7280' }}
              label={{ 
                value: 'mg/dL', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: '12px' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              formatter={(value: number) => [`${value} mg/dL`, 'Glucose']}
            />
            
            {/* Zone lines */}
            <ReferenceLine 
              y={140} 
              stroke="#f59e0b" 
              strokeDasharray="5 5" 
              label={{ value: 'Moderate', position: 'right', fill: '#f59e0b', fontSize: 11 }}
            />
            <ReferenceLine 
              y={180} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ value: 'High', position: 'right', fill: '#ef4444', fontSize: 11 }}
            />
            
            {/* Peak marker */}
            {peakValue && (
              <ReferenceLine 
                y={peakValue} 
                stroke="#dc2626" 
                strokeWidth={2} 
                label={{ value: `Peak: ${peakValue}`, position: 'top', fill: '#dc2626', fontSize: 11 }}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {peakValue && peakTime && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            Expected peak: <span className="font-semibold text-red-600">{peakValue} mg/dL</span> at{' '}
            <span className="font-semibold text-gray-900">{peakTime}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionChart;
