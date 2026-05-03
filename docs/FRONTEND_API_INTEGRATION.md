# Frontend API Integration Guide

## Overview
This guide explains how to use the centralized API client (`axiosClient.ts`) and authentication API (`authApi.ts`) in your React/Vite frontend.

---

## 1. API Client (`src/api/axiosClient.ts`)

### What it does:
- ✅ Centralized axios instance with base URL from `VITE_API_BASE_URL`
- ✅ Auto-attach Bearer token from `localStorage` to all requests
- ✅ Global 401 error handling (clears token, redirects to `/login`)
- ✅ Standardized error responses

### Environment Setup
Create `.env.local` in `fitlife-frontend/` root:
```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Import in any component:
```typescript
import axiosClient from '@/api/axiosClient';

// Example: GET request
const fetchMembers = async () => {
  try {
    const response = await axiosClient.get('/members/admin');
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 2. Auth API (`src/api/authApi.ts`)

### Methods Available:

#### `login(credentials)`
```typescript
import { login } from '@/api/authApi';

const handleLogin = async () => {
  try {
    const response = await login({
      username: 'user@fitlife.local',
      password: 'password123',
    });
    console.log('Login successful:', response.data);
    // Redirects to dashboard or store user in state
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### `register(userInfo)`
```typescript
import { register } from '@/api/authApi';

const handleRegister = async () => {
  try {
    const response = await register({
      username: 'newuser',
      email: 'newuser@fitlife.local',
      password: 'password123',
      confirmPassword: 'password123',
    });
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

#### `isAuthenticated()`
```typescript
import { isAuthenticated } from '@/api/authApi';

if (isAuthenticated()) {
  console.log('User is logged in');
} else {
  console.log('User is not logged in');
}
```

#### `logout()`
```typescript
import { logout } from '@/api/authApi';

const handleLogout = () => {
  logout(); // Clears token and redirects to /login
};
```

#### `getAuthToken()`
```typescript
import { getAuthToken } from '@/api/authApi';

const token = getAuthToken();
console.log('Current token:', token);
```

---

## 3. How to Create Other API Services

### Pattern: Create `src/api/memberApi.ts`
```typescript
import axiosClient from './axiosClient';

export interface Member {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  status: string;
}

export const getMyProfile = async (): Promise<Member> => {
  const response = await axiosClient.get('/members/me');
  return response.data.data;
};

export const updateMyProfile = async (data: Partial<Member>): Promise<Member> => {
  const response = await axiosClient.put('/members/me', data);
  return response.data.data;
};
```

### Use in component:
```typescript
import { getMyProfile, updateMyProfile } from '@/api/memberApi';

const MyProfile = () => {
  const [profile, setProfile] = React.useState<Member | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div>
      {profile && <h1>{profile.fullName}</h1>}
    </div>
  );
};
```

---

## 4. Error Handling

### Global 401 errors are handled automatically:
- Token is cleared from localStorage
- User is redirected to `/login`
- Error message is logged

### Handle errors per request:
```typescript
try {
  await login(credentials);
} catch (error) {
  // error is already formatted by interceptor
  console.error('Login error:', error.message);
}
```

---

## 5. Token Management

### Token is auto-stored on login/register:
```typescript
// Token is automatically saved to localStorage by authApi methods
const response = await login(credentials);
// localStorage.getItem('auth_token') now contains JWT
```

### Token is auto-attached to requests:
```typescript
// axiosClient request interceptor adds:
// headers: { Authorization: 'Bearer <token>' }
// No need to manually add it!
```

### Token is cleared on logout or 401:
```typescript
logout(); // Clears localStorage and redirects

// OR auto-clears on 401 response
```

---

## 6. Quick Start: Login Page Example

```typescript
import React, { useState } from 'react';
import { login } from '@/api/authApi';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ username, password });
      console.log('Login successful:', response.data);
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginPage;
```

---

## 7. ProtectedRoute Component Example

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/api/authApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
```

### Use in routing:
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
];
```

---

## 8. Next Steps

1. **Update `src/main.tsx`** to load `.env.local` variables (Vite auto-loads them)
2. **Create Login & Register pages** using the examples above
3. **Test login flow**: Register → Login → Check if token in localStorage
4. **Create other API services** following the `memberApi.ts` pattern
5. **Integrate with UI components** (forms, buttons, etc.)

---

## 9. Debugging Tips

### Check if token is saved:
```javascript
// In browser console
localStorage.getItem('auth_token')
```

### Check API base URL:
```javascript
// In React component
console.log(import.meta.env.VITE_API_BASE_URL)
```

### Monitor network requests:
- Open DevTools → Network tab
- Look for Authorization header: `Bearer <token>`

### Test API endpoints directly:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@fitlife.local","password":"123456"}'
```

---

**Ready to go!** 🚀 Start building your login/register pages now.

