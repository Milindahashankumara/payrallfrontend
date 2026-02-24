// import { BrowserRouter as Route, Routes } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Login from './components/login/Login';
import ForgetPassword from './components/forget-password/ForgetPassword';
import ResetPassword from './components/reset-password/ResetPassword.js';
import Home from './pages/Home.js'
import Employees from './pages/Employees.js';
import EmployeeCategories from './pages/EmployeeCategories.js';
import Departments from './pages/Departments.js';
import JobRoles from './pages/JobRoles.js';
import AppLayout from './layouts/AppLayout.js';
import AuthLayout from './layouts/AuthLayout.js';
import OT from './pages/OT.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import GenerateSalary from './pages/GenerateSalary.js';
import SalaryReports from './pages/SalaryReports.js';
import Loan from './pages/Loan.js';
import Leaves from './pages/Leaves.js';
import LeavesNew from './pages/LeavesNew.js';
import SpecialHolidays from './pages/SpecialHolidays.js';
import OTusage from './pages/OTusage.js';
import Users from './pages/Users.js';

function App() {
  return (
    <div>
      <Routes>
        
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-pass" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/empcategories" element={<EmployeeCategories />} />
          <Route path="/generatesalary" element={<GenerateSalary />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/leavesnew" element={<LeavesNew />} />
          <Route path="/specialHolidays" element={<SpecialHolidays />} />
          <Route path="/otusage" element={<OTusage />} />
          <Route path="/loan" element={<Loan />} />
          <Route path="/salaryreports" element={<SalaryReports />} />
          {<Route path="/departments" element={<Departments />} />}
          {<Route path="/jobroles" element={<JobRoles />} />}
          { <Route path="/OT" element={<OT />} /> }
          <Route path="/users" element={<Users />} />

        </Route>

      </Routes>
    </div>
  );
}

export default App;
