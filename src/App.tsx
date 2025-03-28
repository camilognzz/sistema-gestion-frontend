import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from './components/auth/Login';
import Registration from './components/auth/Registration';
import Users from './components/service/Users';
import Update from './components/userspage/Update';
import Management from './components/userspage/Management';
import Profile from './components/userspage/Profile';
import Project from "./components/projectspage/Project";
import CreateProject from "./components/projectspage/CreateProject";
import UpdateProject from "./components/projectspage/UpdateProject";
import  Contact  from "./components/contactspage/Contact";
import  CreateContact  from "./components/contactspage/CreateContact";
import  UpdateContact  from "./components/contactspage/UpdateContact";
import Volunteer from "./components/volunteerspage/Volunteer";
import  CreateVolunteer  from "./components/volunteerspage/CreateVolunteer";
import UpdateVolunteer from "./components/volunteerspage/UpdateVolunteer";
import Financial from "./components/financialspage/Financial";



function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/api/v1/proyectos" element={<Project />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/update-project/:projectId" element={<UpdateProject />} />
            <Route path="/contactos" element={<Contact />} />
            <Route path="/crear-contacto" element={<CreateContact />} />
            <Route path="/actualizar-contacto/:contactId" element={<UpdateContact />} />
            <Route path="/voluntarios" element={<Volunteer />} />
            <Route path="/crear-voluntario" element={<CreateVolunteer />} />
            <Route path="/actualizar-voluntario/:volunteerId" element={<UpdateVolunteer />} />

            {/* Admin-only routes */}
            {Users.adminOnly() && (
              <>
                <Route path="/register" element={<Registration />} />
                <Route path="/admin/user-management" element={<Management />} />
                <Route path="/update-user/:userId" element={<Update />} />
                <Route path="/finanzas" element={<Financial />} />
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
