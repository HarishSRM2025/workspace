export const fetchWithAuth = async (url, options = {}) => {
  const userDataStr = localStorage.getItem("hrms_tenant_user_data");
  let token = "";

  const getTokenFromStoredData = (storedData) => {
    return storedData?.data?.token || storedData?.token || storedData?.data?.data?.token || storedData?.data?.data?.data?.token || "";
  };

  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      // Handle the gateway response structure: { success: true, data: { token, user } }
      token = getTokenFromStoredData(userData);
      if (!token) {
        console.warn("No auth token found in hrms_tenant_user_data", userData);
      }
    } catch (e) {
      console.error("Error parsing user data for auth logic:", e);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Gateway returns 401 or 403 on expired/missing tokens
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("hrms_tenant_user_data");
    if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
    }
    return Promise.reject(new Error("Session expired. Please log in again."));
  }

  // Parse JSON response
  let result;
  try {
    result = await response.json();
  } catch (e) {
    result = { success: false, message: "Invalid response format" };
  }

  return result;
};