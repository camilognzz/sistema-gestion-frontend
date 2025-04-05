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
import Balance from "./components/financialspage/Balance";
import CreateTransaction from "./components/financialspage/CreateTransaction";
import Categories from "./components/financialspage/Categories";
import CreateCategory from "./components/financialspage/CreateCategory";
import UpdateCategory from "./components/financialspage/UpdateCategory";
import UpdateTransaction from "./components/financialspage/UpdateTransaction";
import { ProfileProvider } from "./components/context/ProfileContext";



function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="content">
        <ProfileProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/proyectos" element={<Project />} />
            <Route path="/crear-proyecto" element={<CreateProject />} />
            <Route path="/actualizar-proyecto/:projectId" element={<UpdateProject />} />
            <Route path="/contactos" element={<Contact />} />
            <Route path="/crear-contacto" element={<CreateContact />} />
            <Route path="/actualizar-contacto/:contactId" element={<UpdateContact />} />
            <Route path="/voluntarios" element={<Volunteer />} />
            <Route path="/crear-voluntario" element={<CreateVolunteer />} />
            <Route path="/actualizar-voluntario/:volunteerId" element={<UpdateVolunteer />} />

            {/* Admin-only routes */}
            {Users.adminOnly() && (
              <>
                <Route path="/registro" element={<Registration />} />
                <Route path="/usuarios" element={<Management />} />
                <Route path="/actualizar-usuario/:userId" element={<Update />} />
                <Route path="/finanzas" element={<Financial />} />
                <Route path="/balance" element={<Balance />} />
                <Route path="/crear-transaccion" element={<CreateTransaction />} />
                <Route path="/actualizar-transaccion/:transactionId" element={<UpdateTransaction />} />
                <Route path="/categorias" element={<Categories />} />
                <Route path="/crear-categoria" element={<CreateCategory />} />
                <Route path="/actualizar-categoria/:categoryId" element={<UpdateCategory />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          </ProfileProvider>
        </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
