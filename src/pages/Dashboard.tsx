import { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];

export default function Dashboard() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'feedback'), (snapshot) => {
      const data: Feedback[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      }));
      setFeedback(data);
    });

    return () => unsub();
  }, []);

  // helper: handle Timestamp or {seconds} or undefined
  const formatDate = (d?: Feedback['date']) => {
    if (!d) return '—';
    // Firestore Timestamp has toDate()
    if (d instanceof Timestamp) return d.toDate().toLocaleDateString();
    const seconds = (d as { seconds?: number })?.seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toLocaleDateString();
    }
    return '—';
  };

  // Aggregate score distribution (memoized)
  const scoreData = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((score) => ({
        name: `${score} Star`,
        // Percentage value
        value: +(
          (feedback.filter((f) => (f.score ?? 0) === score).length / feedback.length) *
          100
        ).toFixed(1),
      })),
    [feedback],
  );

  return (
    <div className="mt-10 mx-6">
      <h1 className="text-2xl mb-5 font-bold">Dashboard</h1>
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row md:items-start space-y-8 md:space-y-0 md:space-x-8">
        {/* Table */}
        <div className="overflow-y-auto w-full md:w-[60%] border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Employee Name</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id} className="border-b">
                  <td className="px-4 py-2">{formatDate(f.date)}</td>
                  <td className="px-4 py-2">{f.employeeName ?? '—'}</td>
                  <td className="px-4 py-2">{f.score ?? '—'}</td>
                  <td className="px-4 py-2 truncate max-w-[300px]">{f.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Real-time Pie Chart */}
        <div className="w-full md:w-[40%] h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={scoreData} dataKey="value" nameKey="name" outerRadius={100} label>
                {scoreData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${name}`, `${value}%`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
