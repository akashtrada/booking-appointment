import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useUiStore from '../store/uiStore';
import { login } from '../services/authService';

export default function useAuth() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      setAuthenticated(true);
      return;
    }

    setLoading(true);
    login()
      .then((data) => {
        localStorage.setItem('token', data.token.token);
        if (data.user?.id) localStorage.setItem('user_id', data.user.id);
        setUser(data.user);
        setAuthenticated(true);
      })
      .catch((err) => {
        const msg = err?.message || 'Authentication failed';
        setError(msg);
        showToast(msg, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setAuthenticated, setUser, setLoading, setError, showToast]);
}
