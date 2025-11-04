// src/components/admin/AdminInvitationsPage.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/api';
import { 
  Clipboard, 
  CheckCircle, 
  Loader2, 
  PlusCircle, 
  XCircle, 
  RefreshCw,
  UserPlus,
  Mail,
  Calendar,
  AlertTriangle,
  Clock,
  Search,
  FilterX,
  ChevronDown,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const AdminInvitationsPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [newInvite, setNewInvite] = useState({ email: '', expiresDays: 7, role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredInvitations, setFilteredInvitations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load invitations when component mounts
  const loadInvitations = async () => {
    setLoading(true);
    try {
      const [invitationsResponse, statsResponse] = await Promise.all([
        adminService.getAdminInvitations(),
        adminService.getInvitationStats()
      ]);
      
      const invites = invitationsResponse.data.invitations || [];
      setInvitations(invites);
      setFilteredInvitations(invites);
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error("Error loading invitation data:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    loadInvitations().finally(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    });
  };
  
  useEffect(() => {
    loadInvitations();
  }, []);
  
  // Filter invitations when search term or status filter changes
  useEffect(() => {
    if (!invitations.length) return;
    
    const filtered = invitations.filter(invite => {
      const matchesSearch = !searchTerm || 
        invite.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invite.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredInvitations(filtered);
  }, [searchTerm, statusFilter, invitations]);
  
  // Handle creating a new invitation
  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    
    if (!newInvite.email) {
      toast.error("Email address is required");
      return;
    }
    
    setCreating(true);
    try {
      const response = await adminService.createAdminInvitation(newInvite);
      
      setInvitations([response.data.invitation, ...invitations]);
      toast.success("Invitation created successfully");
      
      // Reset form
      setNewInvite({ email: '', expiresDays: 7, role: 'admin' });
      
      // Refresh stats
      const statsResponse = await adminService.getInvitationStats();
      setStats(statsResponse.data.stats);
      
    } catch (error) {
      console.error("Error creating invitation:", error);
      toast.error(error.message || "Failed to create invitation");
    } finally {
      setCreating(false);
    }
  };
  
  // Copy invitation link to clipboard
  const copyInvitationLink = (token) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/admin/signup?token=${token}`;
    
    navigator.clipboard.writeText(inviteUrl)
      .then(() => {
        setCopied({ ...copied, [token]: true });
        toast.success("Invitation link copied to clipboard");
        setTimeout(() => {
          setCopied({ ...copied, [token]: false });
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  };
  
  // Delete an invitation
  const deleteInvitation = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?")) {
      return;
    }
    
    try {
      await adminService.deleteAdminInvitation(id);
      toast.success("Invitation revoked successfully");
      
      // Update the invitation in the list
      setInvitations(invitations.map(invite => 
        invite._id === id ? { ...invite, status: 'revoked' } : invite
      ));
      
      // Refresh stats
      const statsResponse = await adminService.getInvitationStats();
      setStats(statsResponse.data.stats);
    } catch (err) {
      console.error("Error revoking invitation:", err);
      toast.error("Failed to revoke invitation");
    }
  };
  
  // Resend an invitation
  const resendInvitation = async (id) => {
    try {
      await adminService.resendAdminInvitation(id);
      toast.success("Invitation resent successfully");
      
      // Refresh data
      loadInvitations();
    } catch (err) {
      console.error("Error resending invitation:", err);
      toast.error("Failed to resend invitation");
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };
  
  // Helper function to get status styles
  const getStatusStyles = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'used':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-1">
          <UserPlus className="h-6 w-6 mr-2 text-teal-600" />
          Admin Invitations
        </h1>
        <p className="text-gray-600">
          Invite and manage new administrators to your platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Create Invitation Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 text-white">
              <h2 className="text-lg font-bold flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                Invite New Admin
              </h2>
              <p className="text-teal-100 text-sm mt-1">
                Send a secure invitation link
              </p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreateInvitation} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite({...newInvite, email: e.target.value})}
                      className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={newInvite.role}
                      onChange={(e) => setNewInvite({...newInvite, role: e.target.value})}
                      className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="admin">Full Admin</option>
                      <option value="manager">Manager</option>
                      <option value="support">Support Staff</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Determines access level and permissions
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invitation Expires In
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={newInvite.expiresDays}
                      onChange={(e) => setNewInvite({...newInvite, expiresDays: parseInt(e.target.value)})}
                      className="pl-10 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value={1}>1 day</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Link will automatically expire after this period
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    {creating ? "Creating..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Summary Stats */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">Active Invites</span>
                  <span className="text-2xl font-semibold text-teal-600">{stats?.active || 0}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">Total Sent</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    {(stats?.active || 0) + (stats?.used || 0) + (stats?.expired || 0) + (stats?.revoked || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">About Admin Invitations</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Each invitation is single-use only</li>
                    <li>Links automatically expire after the set period</li>
                    <li>New admins will need to create a password</li>
                    <li>Only invite people you trust with admin access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Invitations List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Invitation History</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track and manage existing invitations
                </p>
              </div>
              
              <div className="mt-3 sm:mt-0 flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="px-6 py-3 border-b border-gray-200 bg-white">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative flex-grow max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="used">Used</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
                
                {/* Clear Filters */}
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center py-2 px-3 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                  >
                    <FilterX className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-0">
              {filteredInvitations.length === 0 ? (
                <div className="text-center py-12">
                  {searchTerm || statusFilter !== 'all' ? (
                    <div>
                      <FilterX className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No matching invitations</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new invitation.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInvitations.map((invite) => (
                        <tr key={invite._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{invite.email}</div>
                                <div className="text-xs text-gray-500">{invite.role || 'Admin'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(invite.status)}`}>
                              {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <div className="flex justify-end space-x-2">
                              {invite.status === 'active' && (
                                <>
                                  <button
                                    onClick={() => copyInvitationLink(invite.token)}
                                    className="text-teal-600 hover:text-teal-900 focus:outline-none flex items-center transition-colors"
                                  >
                                    {copied[invite.token] ? (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    ) : (
                                      <LinkIcon className="h-4 w-4 mr-1" />
                                    )}
                                    <span>{copied[invite.token] ? 'Copied' : 'Copy'}</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => resendInvitation(invite._id)}
                                    className="text-blue-600 hover:text-blue-900 focus:outline-none flex items-center ml-3 transition-colors"
                                  >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    <span>Resend</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => deleteInvitation(invite._id)}
                                    className="text-red-600 hover:text-red-900 focus:outline-none flex items-center ml-3 transition-colors"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    <span>Revoke</span>
                                  </button>
                                </>
                              )}
                              
                              {invite.status === 'expired' && (
                                <button
                                  onClick={() => resendInvitation(invite._id)}
                                  className="text-blue-600 hover:text-blue-900 focus:outline-none flex items-center transition-colors"
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  <span>Reactivate</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInvitationsPage;