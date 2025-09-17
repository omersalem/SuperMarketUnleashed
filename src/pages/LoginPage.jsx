import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signIn } from '../firebase/auth';

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
         style={{ background: 'radial-gradient(circle, rgba(26,26,46,0.8) 0%, rgba(13,17,23,1) 70%)' }}>
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg"
           style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('login.title')}</h1>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium">{t('login.email')}</label>
            <input type="email" name="email" id="email" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium">{t('login.password')}</label>
            <input type="password" name="password" id="password" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label htmlFor="role" className="block mb-2 text-sm font-medium">{t('login.role')}</label>
            <select id="role" name="role" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">{t('login.admin')}</option>
              <option value="user">{t('login.user')}</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-2 px-4 font-bold text-white rounded-full"
                  style={{ background: 'linear-gradient(to right, #007BFF, #00AFFF)' }} disabled={loading}>
            {loading ? 'Logging in...' : t('login.loginButton')}
          </button>
        </form>
        <div className="flex justify-center space-x-4">
          <button onClick={() => changeLanguage('en')} className="text-sm text-gray-400 hover:text-white">English</button>
          <button onClick={() => changeLanguage('ar')} className="text-sm text-gray-400 hover:text-white">العربية</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
