import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Google authentication
export async function googleLogin(token: string) {
  const response = await apiRequest("/api/auth/google-login", {
    method: "POST",
    body: JSON.stringify({ token })
  });
  return response;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export async function apiRequest(
  url: string,
  options: RequestOptions = {},
): Promise<any> {
  // Check for auth token in localStorage
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    // Add Authorization header with token if available and not already provided
    ...(token && !options.headers?.Authorization && {
      'Authorization': `Bearer ${token}`
    }),
    ...(options.headers || {})
  };

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
  };

  if (options.body) {
    config.body = options.body;
  }

  const res = await fetch(url, config);

  // Log the request details for debugging
  console.log("API Request:", { url, config });

  await throwIfResNotOk(res);

  if (res.status === 204) return null;
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    throw new Error('Unauthorized');
  }

  try {
    return await res.json();
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token from localStorage for all requests
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
