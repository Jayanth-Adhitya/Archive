import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import FloatingLogos from '../components/ui/FloatingLogos';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Floating logo bubbles in background */}
      <FloatingLogos />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <img
            src="https://mehh.ae/images/logo2.png"
            alt="Logo"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white mb-2">AI Image Archive</h1>
          <p className="text-white/60">Create your account to get started</p>
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
