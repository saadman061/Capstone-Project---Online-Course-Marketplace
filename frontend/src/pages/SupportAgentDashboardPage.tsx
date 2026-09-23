import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ticketAPI } from '../api/client';
import { RootState } from '../redux/store';

interface Ticket {
  ticketId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedAgentId?: string | null;
  raisedByUser?: { name: string; email: string };
}

const statusColors: { [key: string]: string } = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

const priorityColors: { [key: string]: string } = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const SupportAgentDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'support_agent' || user?.role === 'admin') {
      fetchTickets();
    }
  }, [user?.role]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getInbox();
      setTickets(response.data);
    } catch (err: any) {
      console.error('Error fetching ticket inbox:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (ticketId: string) => {
    setError('');
    setSuccess('');
    try {
      const response = await ticketAPI.update(ticketId, { claim: true, status: 'in_progress' });
      setTickets(tickets.map(t => (t.ticketId === ticketId ? { ...t, ...response.data } : t)));
      setSuccess('Ticket claimed');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      console.error('Error claiming ticket:', err);
      setError(err.response?.data?.error || 'Failed to claim ticket');
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    setError('');
    try {
      const response = await ticketAPI.update(ticketId, { status });
      setTickets(tickets.map(t => (t.ticketId === ticketId ? { ...t, ...response.data } : t)));
    } catch (err: any) {
      console.error('Error updating ticket:', err);
      setError(err.response?.data?.error || 'Failed to update ticket');
    }
  };

  // Redirect if not a support agent or admin (after hooks)
  if (user?.role !== 'support_agent' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">Support Inbox</h1>
          <p className="text-gray-600">Tickets assigned to you, plus unassigned tickets you can claim</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-2xl font-bold text-gray-700">No tickets right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.ticketId} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{ticket.subject}</h3>
                    {ticket.raisedByUser && (
                      <p className="text-sm text-gray-500">
                        From {ticket.raisedByUser.name} ({ticket.raisedByUser.email})
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[ticket.priority]}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{ticket.description}</p>

                <div className="flex flex-wrap gap-3 items-center pt-4 border-t">
                  {!ticket.assignedAgentId && (
                    <button
                      onClick={() => handleClaim(ticket.ticketId)}
                      className="px-4 py-2 bg-secondary text-white font-bold rounded-lg text-sm hover:bg-primary transition"
                    >
                      Claim Ticket
                    </button>
                  )}
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.ticketId, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <span className="text-sm text-gray-500 ml-auto">
                    Raised on {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportAgentDashboardPage;
