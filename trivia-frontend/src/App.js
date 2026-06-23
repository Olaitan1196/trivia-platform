import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import EventDetail from './pages/EventDetail/EventDetail';
import PaymentConfirmation from './pages/PaymentConfirmation/PaymentConfirmation';
import AdminLayout from './pages/Admin/AdminLayout';
import CategoryFees from './pages/Admin/CategoryFees/CategoryFees';
import Questions from './pages/Admin/Questions/Questions';
import Events from './pages/Admin/Events/Events';
import Stages from './pages/Admin/Stages/Stages';
import Quiz from './pages/Quiz/Quiz';
import Ranking from './pages/Ranking/Ranking';
import AdminSettings from './pages/Admin/Settings/AdminSettings';
import Wallet from './pages/Wallet/Wallet';
import AdminWithdrawals from './pages/Admin/Withdrawals/AdminWithdrawals';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        <Route path="/quiz/:eventId/:stageId" element={<Quiz />} />
        <Route path="/ranking/:eventId/:stageId" element={<Ranking />} />
        <Route path="/wallet" element={<Wallet />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="category-fees" element={<CategoryFees />} />
          <Route path="questions" element={<Questions />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:eventId/stages" element={<Stages />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;