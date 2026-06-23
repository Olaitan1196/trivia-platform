import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [navigate]);

  if (checking) {
    return <div className="admin-loading">Checking admin access...</div>;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">Admin Panel</h2>
        <nav className="admin-nav">
          <Link className={location.pathname === '/admin/category-fees' ? 'active' : ''} to="/admin/category-fees">
            Category Fees
          </Link>
          <Link className={location.pathname === '/admin/questions' ? 'active' : ''} to="/admin/questions">
            Questions
          </Link>
          <Link className={location.pathname === '/admin/events' ? 'active' : ''} to="/admin/events">
            Events
          </Link>
          <Link className={location.pathname === '/admin/settings' ? 'active' : ''} to="/admin/settings">
            Settings
          </Link>
          <Link className={location.pathname === '/admin/withdrawals' ? 'active' : ''} to="/admin/withdrawals">
            Withdrawals
          </Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;