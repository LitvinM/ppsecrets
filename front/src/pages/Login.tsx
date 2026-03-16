import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';
import { motion } from 'motion/react';
import { Mail, Lock, Key, CheckCircle } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email verification mock state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const { login } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.auth.login({ email, password });
        if (res && res.token) {
          login(res.token);
          navigate('/app');
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        // Register
        await api.auth.register({ email, role: 'User' }, lang);
        // Show verification window (mocking since backend doesn't have the endpoint exposed)
        setShowVerification(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);

    try {
      await api.auth.verifyEmail({
        email,
        password,
        code: verificationCode
      });

      // после подтверждения — логиним
      const res = await api.auth.login({ email, password });
      login(res.token);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center"
        >
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('email_verification_title')}</h2>
          <p className="text-gray-500 mb-8">{t('email_verification_desc')}</p>
          
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full text-center text-2xl tracking-widest px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] focus:border-transparent outline-none mb-6"
            placeholder="000000"
            maxLength={6}
          />
          
          <button
            onClick={handleVerify}
            disabled={loading || verificationCode.length < 6}
            className="w-full bg-[#fd2d55] text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (
              <>
                <CheckCircle size={20} />
                {t('verify')}
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#fd2d55] rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? t('login_title') : t('register_title')}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fd2d55] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fd2d55] text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 mt-4 shadow-md hover:shadow-lg"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div> : (isLogin ? t('login') : t('register'))}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-gray-600 hover:text-[#fd2d55] transition-colors font-medium"
          >
            {isLogin ? t('no_account') : t('have_account')} <span className="text-[#fd2d55] underline">{isLogin ? t('register') : t('login')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
