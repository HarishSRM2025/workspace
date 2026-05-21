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
                    navigate(`/${slug}/auth`, { replace: true });
                    return;
                  }
                } catch (tenantCheckError) {
                  console.error('Error checking user tenant:', tenantCheckError);
                  // If we can't verify the tenant, log the user out
                  localStorage.removeItem('hrms_tenant_user_data');
                  navigate(`/${slug}/auth`, { replace: true });
                  return;
                }
              }
            } catch (e) {
              console.error('Error parsing user data for redirect:', e);
              localStorage.removeItem('hrms_tenant_user_data');
            }
          }
          
          // If no user is logged in or user has no valid tenant, redirect to default tenant
          navigate('/appzoo/auth', { replace: true });
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
    return (
        <>
         <OrgNotFound />
        </>
    );
  }

  // Render nested routes
  return <Outlet />;
}
