import React, { useState, useEffect } from 'react';
import { PolicyType } from './types';
import { HomePage } from './components/HomePage';
import { GeneratorPage } from './components/GeneratorPage';
import { PolicyModal } from './components/PolicyModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'generator'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/generator' || window.location.hash === '#generator') {
        const token = sessionStorage.getItem('aarti_paid_session');
        if (token) {
          return 'generator';
        }
      }
    }
    return 'home';
  });

  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('aarti_paid_session');
    }
    return null;
  });

  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/generator' || window.location.hash === '#generator') {
        setCurrentPage('generator');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePaymentSuccess = (token: string) => {
    setSessionToken(token);
    sessionStorage.setItem('aarti_paid_session', token);
    setCurrentPage('generator');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/generator');
    }
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage
          onPaymentSuccess={handlePaymentSuccess}
          onOpenPolicy={(type) => setActivePolicy(type)}
        />
      ) : (
        <GeneratorPage
          sessionToken={sessionToken}
          onGoHome={navigateToHome}
          onOpenPolicy={(type) => setActivePolicy(type)}
        />
      )}

      {/* Global Legal Policy Modal */}
      <PolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </>
  );
}
