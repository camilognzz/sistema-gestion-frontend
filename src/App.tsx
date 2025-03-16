import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from './components/auth/Login';
import Registration from './components/auth/Registration';
import Users from './components/service/Users';
import Update from './components/userspage/Update';
import Management from './components/userspage/Management';
import Profile from './components/userspage/Profile';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin-only routes */}
            {Users.adminOnly() && (
              <>
                <Route path="/register" element={<Registration />} />
                <Route path="/admin/user-management" element={<Management />} />
                <Route path="/update-user/:userId" element={<Update />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
