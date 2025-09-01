import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { useMessaging } from '../hooks/useMessaging';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const { totalUnreadCount, loadConversations, refreshConversations } = useMessaging();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const conversationsLoadedRef = useRef(false);

  // Load conversations on mount to get unread counts
  useEffect(() => {
    // Only load conversations once when user is authenticated
    if (user && !conversationsLoadedRef.current) {
      conversationsLoadedRef.current = true;
      loadConversations();
    } else if (!user) {
      conversationsLoadedRef.current = false;
    }
  }, [user, loadConversations]);

  const handleLogout = async () => {
    await logout();
    success('Logged out', 'You have been successfully logged out.');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMessagesClick = () => {
    // Refresh conversations when navigating to messages to update badge
    refreshConversations();
    closeMobileMenu(); // Also close mobile menu if open
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Mentor Connect
              </Link>
            </div>
            
            {user && (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  {user.role !== 'ADMIN' && (
                    <Link
                      to="/appointments"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Appointments
                    </Link>
                  )}
                  {user.role !== 'ADMIN' && (
                    <Link
                      to="/messages"
                      onClick={handleMessagesClick}
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium relative transition-colors duration-200"
                    >
                      Messages
                      {totalUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {user.role === 'MENTEE' && (
                    <Link
                      to="/mentors"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Find Mentors
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user.role?.toLowerCase() || 'user'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={toggleMobileMenu}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Open main menu</span>
                    {!isMobileMenuOpen ? (
                      <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    ) : (
                      <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {user && isMobileMenuOpen && (
            <div className="md:hidden animate-fade-in">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <div className="text-base font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {user.role?.toLowerCase() || 'user'}
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  className="mobile-nav-item"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                {user.role !== 'ADMIN' && (
                  <Link
                    to="/appointments"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Appointments
                  </Link>
                )}
                {user.role !== 'ADMIN' && (
                  <Link
                    to="/messages"
                    className="mobile-nav-item flex items-center justify-between"
                    onClick={() => {
                      handleMessagesClick();
                      closeMobileMenu();
                    }}
                  >
                    <span>Messages</span>
                    {totalUnreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {user.role === 'MENTEE' && (
                  <Link
                    to="/mentors"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Find Mentors
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="mobile-nav-item w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};