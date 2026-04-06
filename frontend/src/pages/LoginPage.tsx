import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Card } from '../components/ui/Card';
import { ApiException } from '../types/api';
import { validationRules } from '../utils/validation';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    values: form,
    errors,
    handleChange,
    validateForm,
  } = useFormValidation<LoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: [
      {
        field: 'email',
        validate: (value) => {
          if (!value || !value.trim()) return 'Email is required';
          return validationRules.email(value);
        },
      },
      {
        field: 'password',
        validate: (value) => {
          if (!value) return 'Password is required';
          if (value.length < 6) return 'Password must be at least 6 characters';
          return undefined;
        },
      },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
      });
      success('Welcome back!', 'You have been successfully logged in.');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof ApiException) {
        switch (error.code) {
          case 'INVALID_CREDENTIALS':
            setGeneralError('Invalid email or password');
            break;
          case 'VALIDATION_ERROR':
            setGeneralError('Please check your input and try again');
            break;
          case 'NETWORK_ERROR':
            setGeneralError('Network error. Please check your connection and try again');
            break;
          default:
            setGeneralError(error.message || 'Login failed. Please try again');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-mesh px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <div className="w-full space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-crisp">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l2.4 4.8L19 11l-4.6 2.2L12 18l-2.4-4.8L5 11l4.6-2.2L12 4z" />
              </svg>
            </div>
            <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Sign in to continue your mentorship journey.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Or{' '}
              <Link
                to="/register"
                className="font-semibold text-brand-600 hover:text-brand-700"
              >
                create a new account
              </Link>
            </p>
          </div>

          <Card className="p-6 sm:p-7">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {generalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {generalError}
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />

              <PasswordInput
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs text-slate-500">
            Secure access with real-time mentorship conversations and scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};