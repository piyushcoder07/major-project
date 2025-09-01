import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFormValidation } from '../hooks/useFormValidation';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { ApiException } from '../types/api';
import { validationRules } from '../utils/validation';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'MENTOR' | 'MENTEE' | '';
}

const roleOptions = [
  { value: 'MENTEE', label: 'Mentee - I want to find mentors' },
  { value: 'MENTOR', label: 'Mentor - I want to help others' },
];

export const RegisterPage: React.FC = () => {
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const {
    values: form,
    errors,
    handleChange,
    validateForm,
    setFieldError,
  } = useFormValidation<RegisterForm>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    validationRules: [
      {
        field: 'name',
        validate: validationRules.name,
      },
      {
        field: 'email',
        validate: (value) => {
          if (!value || !value.trim()) return 'Email is required';
          return validationRules.email(value);
        },
      },
      {
        field: 'password',
        validate: validationRules.password,
      },
      {
        field: 'confirmPassword',
        validate: (value, formData) => validationRules.confirmPassword(formData.password)(value),
      },
      {
        field: 'role',
        validate: validationRules.role,
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role as 'MENTOR' | 'MENTEE',
      });
      success('Account created!', 'Welcome to Mentor Connect. Your account has been created successfully.');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof ApiException) {
        switch (error.code) {
          case 'EMAIL_ALREADY_EXISTS':
            setFieldError('email', 'An account with this email already exists');
            break;
          case 'VALIDATION_ERROR':
            if (error.details?.field) {
              setFieldError(error.details.field, error.message);
            } else {
              setGeneralError('Please check your input and try again');
            }
            break;
          case 'NETWORK_ERROR':
            setGeneralError('Network error. Please check your connection and try again');
            break;
          default:
            setGeneralError(error.message || 'Registration failed. Please try again');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {generalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {generalError}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />

            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

            <Select
              label="I want to..."
              name="role"
              value={form.role}
              onChange={handleChange}
              error={errors.role}
              options={roleOptions}
              placeholder="Select your role"
              required
            />

            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a password"
              autoComplete="new-password"
              helperText="Must contain at least 6 characters with uppercase, lowercase, and number"
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};