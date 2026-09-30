'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, PlusCircle, FileText, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast"
import { getOrganizations, archiveOrganization, getMyOrganizations } from '@/lib/api/organization';
import CreateOrganizationDialog from '@/components/organizations/CreateOrganizationDialog';

// Import the Organization type from your types folder:
import { Organization } from '@/types';



const OrganizationDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, eulaStatus, eulaLoading, checkEulaAndRedirect } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [recentlyVisited, setRecentlyVisited] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckingEula, setIsCheckingEula] = useState(true);

  // In app/dashboard/page.tsx, modify the fetchOrganizations function

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      let response;

      // ConnectGo staff can see all organizations
      if (user?.isConnectGoStaff) {
        response = await getOrganizations();
      } else {
        // Regular users only see their own organizations
        response = await getMyOrganizations();
      }

      setOrganizations(response.data as Organization[]);
      
      // Set recently visited (5 most recent)
      if (response.data.length > 0) {
        setRecentlyVisited(response.data.slice(0, 5) as Organization[]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load organizations',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run if authenticated and not currently loading auth
    if (isAuthenticated && user) {
      fetchOrganizations();
    } else if (!isAuthenticated && !loading) {
      router.push('/account/login');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const performEulaCheck = async () => {
      // Only check EULA if user is authenticated and loaded
      if (isAuthenticated && user && !loading) {
        setIsCheckingEula(true);
        try {
          const canProceed = await checkEulaAndRedirect();
          if (!canProceed) {
            // User was redirected to terms, don't continue
            return;
          }
        } catch (error) {
          console.error('EULA check error:', error);
          // Continue with dashboard load even if EULA check fails
        } finally {
          setIsCheckingEula(false);
        }
      } else if (!loading && isAuthenticated) {
        // User is authenticated, no EULA check needed
        setIsCheckingEula(false);
      }
    };

    performEulaCheck();
  }, [isAuthenticated, user, loading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToOrganization = (orgId: string) => {
    router.push(`/dashboard/organization/${orgId}`);
  };

  const handleArchiveOrganization = async (e: React.MouseEvent, orgId: string) => {
    e.stopPropagation(); // Prevent navigation
    
    if (window.confirm('Are you sure you want to archive this organization?')) {
      try {
        await archiveOrganization(orgId);
        toast({
          title: 'Success',
          description: 'Organization archived successfully',
        });
        // Refresh organizations
        fetchOrganizations();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to archive organization',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading || (isCheckingEula && isAuthenticated)) {
    return (
      <div className="flex justify-center items-center h-screen bg-c4c-grey-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-c4c-coral mx-auto mb-4"></div>
          <p className="text-black font-medium">{loading ? 'Loading...' : 'Checking requirements...'}</p>
        </div>
      </div>
    );
  }

  // Show EULA warning if status indicates signature is required
  if (eulaStatus?.requiresSignature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-c4c-grey-bg p-4">
        <div className="max-w-md w-full bg-white rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-c4c-tint-gold mb-4">
              <AlertTriangle className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">
              Action Required
            </h3>
            <p className="text-c4c-petrol text-sm">
              You need to review and sign our Terms & Conditions to access the dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/terms')}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md text-black bg-c4c-coral hover:bg-c4c-petrol hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-c4c-coral"
            >
              <FileText className="h-5 w-5 mr-2" />
              Review & Sign Terms
            </button>

            <button
              onClick={() => router.push('/account/login')}
              className="w-full flex justify-center py-2 px-4 border border-c4c-rule rounded-md text-black bg-white hover:bg-c4c-grey-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-c4c-petrol"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex-1">
        {/* Profile section at the top */}
        <div className="bg-c4c-grey-bg p-4 border-b border-c4c-rule">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-white border border-c4c-rule rounded-full flex items-center justify-center mr-4">
                <svg className="h-8 w-8 text-c4c-petrol" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-medium text-black">Welcome {user?.name || 'user'}</h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* EULA Status Indicator */}
            {eulaStatus && (
              <div className="bg-c4c-tint-sage border border-c4c-sage rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-c4c-sage mr-3" />
                  <div>
                    <p className="text-black font-medium">Terms & Conditions Signed</p>
                    <p className="text-black text-sm">
                      You're all set! Signed version {eulaStatus.currentVersion}
                      {eulaStatus.latestSignature && (
                        <span> on {new Date(eulaStatus.latestSignature.signedAt).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          {/* Recently Visited section */}
          {recentlyVisited.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4 text-black">Recently Visited</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recentlyVisited.map(org => (
                  <div
                    key={org._id}
                    className="bg-white rounded-lg p-4 text-center cursor-pointer hover:bg-c4c-grey-bg transition-colors border border-c4c-rule"
                    onClick={() => navigateToOrganization(org._id)}
                  >
                    <div className="mb-2 flex justify-center">
                      <div className="w-10 h-10 bg-c4c-grey-bg border border-c4c-rule rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-c4c-petrol" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm truncate text-black">{org.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizations list */}
          <div className="bg-white rounded-lg border border-c4c-rule p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-black">
                {user?.isConnectGoStaff
                  ? `All Organizations (${organizations.length})`
                  : `Your Organizations (${organizations.length})`}
              </h2>
              <div className="flex gap-3">
                {/* Create Organization Button */}
                <CreateOrganizationDialog onOrganizationCreated={fetchOrganizations} />
              </div>
            </div>

            {/* Filter and search */}
            <div className="flex justify-between items-end mb-6">
              <div>
                <label className="block text-sm text-black mb-1">Filter by</label>
                <select className="h-10 bg-c4c-grey-bg border border-c4c-rule rounded px-3 text-sm text-black">
                  <option>All</option>
                  <option>Active</option>
                  <option>Archived</option>
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-c4c-petrol pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Organization"
                  className="h-10 pl-10 pr-4 border border-c4c-rule rounded bg-white text-sm leading-normal"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Empty state */}
            {organizations.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-c4c-grey-bg border border-c4c-rule rounded-full mb-4">
                  <PlusCircle className="h-8 w-8 text-c4c-petrol" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-black">No Organizations Yet</h3>
                <p className="text-c4c-petrol mb-4">Create your first organization to get started</p>
              </div>
            )}

            {/* Table header */}
            {organizations.length > 0 && (
              <>
                <div className="grid grid-cols-12 border-b border-c4c-rule py-3 font-medium text-sm text-black">
                  <div className="col-span-8 px-4">Organisation</div>
                  <div className="col-span-4 text-right px-4">Actions</div>
                </div>

                {/* Table body */}
                {filteredOrganizations.map(org => (
                  <div
                    key={org._id}
                    className="grid grid-cols-12 border-b border-c4c-rule py-4 items-center hover:bg-c4c-grey-bg cursor-pointer"
                    onClick={() => navigateToOrganization(org._id)}
                  >
                    <div className="col-span-8 flex items-center px-4">
                      <div className="w-10 h-10 bg-c4c-grey-bg border border-c4c-rule rounded mr-3 flex items-center justify-center">
                        <svg className="w-6 h-6 text-c4c-petrol" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-black">{org.name}</span>
                        <div className="text-xs text-c4c-petrol">{org.city}, {org.country}</div>
                      </div>
                    </div>
                    <div className="col-span-4 flex justify-end px-4">
                      <button
                        className="text-c4c-petrol hover:text-c4c-burgundy"
                        onClick={(e) => handleArchiveOrganization(e, org._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default OrganizationDashboard;