import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ListPage from './pages/ListPage';
import Calendar from './pages/Calendar';
import TopNavbar from "./components/TopNavbar";
import { useState, useEffect } from "react";
import API from './api';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<>
          <TopNavbar user={user} setUser={setUser} />
          <Dashboard user={user} />
        </>} />
        <Route path="/list/:listTitle" element={<>
          <TopNavbar user={user} setUser={setUser} />
          <ListPage user={user} />
        </>} />
        <Route path="/calendar" element={<>
          <TopNavbar user={user} setUser={setUser} />
          <Calendar user={user} setUser={setUser} />
        </>} />
      </Routes>
    </BrowserRouter>
  );
}