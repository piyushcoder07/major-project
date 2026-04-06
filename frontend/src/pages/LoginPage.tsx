import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../contexts/ToastContext';
import { BrandMark } from '../components/BrandMark';
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

interface DemoCredentialGroup {
  role: 'Admin' | 'Mentor' | 'Mentee';
  accounts: Array<{
    email: string;
    password: string;
    label: string;
  }>;
}

const demoCredentialGroups: DemoCredentialGroup[] = [
  {
    role: 'Admin',
    accounts: [
      { email: 'admin@mentorconnect.com', password: 'admin123', label: 'Platform Admin' },
      { email: 'support@mentorconnect.com', password: 'admin123', label: 'Support Team' },
    ],
  },
  {
    role: 'Mentor',
    accounts: [
      { email: 'john.doe@techcorp.com', password: 'mentor123', label: 'Web Development Mentor' },
      { email: 'sarah.wilson@datatech.ai', password: 'mentor123', label: 'Data Science Mentor' },
    ],
  },
  {
    role: 'Mentee',
    accounts: [
      { email: 'alice.johnson@university.edu', password: 'mentee123', label: 'Computer Science Student' },
      { email: 'priya.patel@bootcamp.tech', password: 'mentee123', label: 'Cybersecurity Learner' },
    ],
  },
];

export const LoginPage: React.FC = () => {
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app';

  const {
    values: form,
    errors,
    handleChange,
    validateForm,
    setFieldValue,
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

    const isValid = await validateForm();
    if (!isValid) {
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

  const applyDemoCredentials = (email: string, password: string) => {
    setFieldValue('email', email);
    setFieldValue('password', password);
    setGeneralError('');
  };

  return (
    <div className="min-h-screen bg-hero-mesh px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-crisp">
              <BrandMark className="h-6 w-6" />
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
            <p className="mt-2 text-sm text-slate-500">
              Want a quick tour first?{' '}
              <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
                Open the homepage
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

          <div className="surface-card p-5 sm:p-6 lg:col-span-2">
            <h3 className="text-base font-semibold text-slate-900">Demo Credentials</h3>
            <p className="mt-1 text-sm text-slate-600">
              Select any account below to auto-fill login fields. You can also register a fresh account anytime.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {demoCredentialGroups.map((group) => (
                <article key={group.role} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{group.role}</h4>
                  <div className="mt-3 space-y-2.5">
                    {group.accounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => applyDemoCredentials(account.email, account.password)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/60"
                      >
                        <p className="truncate text-sm font-semibold text-slate-800">{account.label}</p>
                        <p className="truncate text-xs text-slate-600">{account.email}</p>
                        <p className="text-xs font-medium text-brand-700">Password: {account.password}</p>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 lg:col-span-2">
            Secure access with real-time mentorship conversations and scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};