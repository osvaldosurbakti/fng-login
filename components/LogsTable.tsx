// app/dashboard/LogsTable.tsx
"use client";

type Log = {
  _id: string;
  userEmail: string;
  role: string;
  action: string;
  timestamp: string;
};

interface LogsTableProps {
  logs: Log[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  return (
    <div className="bg-white rounded shadow">
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="p-2">Time</th>
            <th className="p-2">User</th>
            <th className="p-2">Role</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id} className="border-t">
              <td className="p-2">{new Date(l.timestamp).toLocaleString()}</td>
              <td className="p-2">{l.userEmail}</td>
              <td className="p-2">{l.role}</td>
              <td className="p-2">{l.action}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td className="p-2" colSpan={4}>
                No logs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}