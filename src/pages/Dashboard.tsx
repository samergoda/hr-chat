import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1"];

export default function Dashboard() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "feedback"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedback(data);
    });

    return () => unsub();
  }, []);

  // Aggregate score distribution
  const scoreData = [1, 2, 3, 4, 5].map((score) => ({
    name: `${score} Star`,
    value: feedback.filter((f) => f.score === score).length,
  }));

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 p-6 space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Table */}
        <div className="overflow-y-auto border rounded-lg">
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
                  <td className="px-4 py-2">{new Date(f.date.seconds * 1000).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{f.employeeName}</td>
                  <td className="px-4 py-2">{f.score}</td>
                  <td className="px-4 py-2 truncate max-w-[300px]">{f.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Real-time Pie Chart */}
        <div className="w-full h-80">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={scoreData} dataKey="value" nameKey="name" outerRadius={100} label>
                {scoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
