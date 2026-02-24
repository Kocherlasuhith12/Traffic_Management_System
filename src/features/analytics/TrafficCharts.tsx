import { Intersection, HistoricalDataPoint } from '@/types/traffic';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrafficChartsProps {
  intersections: Intersection[];
  historicalData: HistoricalDataPoint[];
}

const TrafficCharts = ({ intersections, historicalData }: TrafficChartsProps) => {
  // Current vehicle counts for bar chart
  const chartData = intersections[0]?.lanes.map(lane => ({
    name: lane.direction,
    vehicles: lane.vehicleCount,
    queue: lane.queueLength,
  })) || [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Vehicle Density by Lane</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: 'hsl(215, 12%, 55%)', fontSize: 12 }} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 12%)',
                border: '1px solid hsl(220, 14%, 18%)',
                borderRadius: '8px',
                fontSize: 12,
                color: 'hsl(210, 20%, 92%)',
              }}
            />
            <Bar dataKey="vehicles" fill="hsl(142, 60%, 45%)" radius={[4, 4, 0, 0]} name="Vehicles" />
            <Bar dataKey="queue" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Queue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficCharts;
