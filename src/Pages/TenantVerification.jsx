import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import OrgNotFound from './OrgNotFound';

export default function TenantVerification() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const verifyTenant = async () => {
      try {
        // Check if user data exists in localStorage first
        const userDataStr = localStorage.getItem('hrms_tenant_user_data');
        let userData = null;
        if (userDataStr) {
          try {
            userData = JSON.parse(userDataStr);
          } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('hrms_tenant_user_data');
          }
        }
        // Get user slug from either new or old data structure
        const userSlug = userData?.data?.user?.slug || userData?.data?.data?.data?.user?.slug;
        // Call the tenant verification API
        const response = await fetch(API_ENDPOINTS.TENANT_GET(slug), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Tenant not found');
        }

        const data = await response.json();
        
        if (!isMounted) return;

        // Tenant exists
        // Check if user data exists in localStorage
        const currentPath = window.location.pathname;
          
        if (userSlug === slug) {
          if (!currentPath.includes(`/${slug}/home`)) {
            navigate(`/${slug}/home`, { replace: true });
          }
        } else {
          if (!currentPath.endsWith("/auth")) {
            navigate(`/${slug}/auth`, { replace: true });
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Tenant verification error:', err);
        if (isMounted) {
          // If this is a network/fetch/server connection error, show a Connection Failed page
          const isNetworkError = err.message === 'Failed to fetch' || 
                                 err.message.includes('network') || 
                                 err.message.includes('fetch') ||
                                 err.message.includes('connect');
          if (isNetworkError) {
            setError(`Could not connect to the API Gateway. Error: ${err.message}`);
            setLoading(false);
            return;
          }

          // If tenant not found, check if user is logged in and redirect to their correct tenant
          const userDataStr = localStorage.getItem('hrms_tenant_user_data');
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              const userSlug = userData?.data?.user?.slug || userData?.data?.data?.data?.user?.slug;
              if (userSlug) {
                // Verify that the user's tenant still exists
                try {
                  const userTenantResponse = await fetch(API_ENDPOINTS.TENANT_GET(userSlug), {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  if (userTenantResponse.ok) {
                    // User's tenant exists, redirect to it
                    if (userSlug !== slug) {
                      const currentPath = window.location.pathname;
                      const pathAfterSlug = currentPath.split('/').slice(2).join('/');
                      navigate(`/${userSlug}/${pathAfterSlug || 'home'}`, { replace: true });
                      return;
                    }
                  } else {
                    // User's tenant no longer exists, log them out
                    localStorage.removeItem('hrms_tenant_user_data');
                    setError('Tenant not found');
                    setLoading(false);
                    return;
                  }
                } catch (tenantCheckError) {
                  console.error('Error checking user tenant:', tenantCheckError);
                  // If we can't verify the tenant, log the user out
                  localStorage.removeItem('hrms_tenant_user_data');
                  setError('Tenant not found');
                  setLoading(false);
                  return;
                }
              }
            } catch (e) {
              console.error('Error parsing user data for redirect:', e);
              localStorage.removeItem('hrms_tenant_user_data');
            }
          }
          
          // If no user is logged in or user has no valid tenant, show OrgNotFound page
          setError('Tenant not found');
          setLoading(false);
          return;
        }
      }
    };

    if (slug) {
      verifyTenant();
    }
    
    return () => {
      isMounted = false;
    };
  }, [slug, navigate]);

  if (loading && !error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3B7BFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ color: '#7A88A8', fontSize: 16 }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    if (error.includes('Could not connect to the API Gateway')) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#F0F4FC',
          padding: '24px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: 24,
            border: '1.5px solid #FCA5A5',
            boxShadow: '0 4px 24px rgba(220,38,38,.08)',
            padding: '48px 44px 40px',
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'rgba(239,68,68,.10)',
              border: '1.5px solid rgba(239,68,68,.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 22px',
            }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#EF4444', fontSize: '32px' }} />
            </div>
            <h1 style={{ fontSize: 24, margin: '0 0 10px', color: '#111827', fontWeight: 600 }}>Connection Failed</h1>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px' }}>
              The workspace application was unable to reach the API Gateway.
            </p>
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '12px',
              textAlign: 'left',
              fontSize: 12,
              fontFamily: 'monospace',
              color: '#374151',
              marginBottom: 20
            }}>
              <strong>Technical Detail:</strong><br />
              - Target URL: {API_ENDPOINTS.TENANT_GET(slug)}<br />
              - Error: {error}
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
              <strong>For Local Development:</strong> Make sure both your <strong>gateway</strong> (port 4000) and <strong>auth_service</strong> (port 3000) backend servers are running.
            </p>
          </div>
        </div>
      );
    }

    return (
        <>
         <OrgNotFound />
        </>
    );
  }

  // Render nested routes
  return <Outlet />;
}
