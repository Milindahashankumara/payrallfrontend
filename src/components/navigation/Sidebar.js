import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HiMenu,
  HiX,
  HiHome,
  HiUsers,
  HiUser,
  HiChevronLeft,
  HiChevronRight,
  HiDatabase,
  HiDocument,
  HiFire,
  HiCalculator,
  HiCash,
  HiDuplicate,
  HiBriefcase,
  HiGlobe,
  HiFlag,
  HiCalendar
} from 'react-icons/hi';

const LINKS = [
  { to: '/home', label: 'Home', Icon: HiHome },
  { to: '/employees', label: 'Employees', Icon: HiUsers },
  { to: '/generatesalary', label: 'Generate Salary', Icon: HiDatabase },
  { to: '/salaryreports', label: 'Salary Reports', Icon: HiDocument },
  // { to: '/leaves', label: 'Leaves', Icon: HiFire },
  { to: '/leavesnew', label: 'Leavesnew', Icon: HiFire },
  { to: '/Otusage', label: 'OT Usage', Icon: HiCalculator },
  { to: '/loan', label: 'Loans', Icon: HiCash },
  { to: '/departments', label: 'Departments', Icon: HiGlobe },
  { to: '/jobroles', label: 'Job Roles', Icon: HiBriefcase },
  { to: '/specialHolidays', label: 'Mercantile Holidays', Icon: HiCalendar },
  { to: '/empcategories', label: 'Employee Categories', Icon: HiDuplicate },
  { to: '/OT', label: 'OT Settings', Icon: HiFlag },
  { to: '/users', label: 'Users', Icon: HiUser }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar-collapsed')) ?? false;
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // close mobile drawer on ESC or click outside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    const onClick = (e) => {
      if (mobileOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [mobileOpen]);

  const baseLink = 'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm truncate no-underline font-medium tracking-wide';

  return (
    <>
      {/* Floating mobile open button (small screens only) */}
      <button
        aria-label="Open sidebar"
        className="md:hidden fixed left-4 bottom-6 z-50 p-3 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        onClick={() => setMobileOpen(true)}
      >
        <HiMenu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* panel */}
        <nav
          ref={drawerRef}
          aria-label="Mobile sidebar"
          className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 transform transition-transform ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center font-semibold">A</div>
              <div className="text-sm font-semibold text-gray-800">Arithmos</div>
            </div>
            <button
              aria-label="Close sidebar"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <HiX className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="space-y-1">
            {LINKS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Desktop sidebar (md and up) */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-white/60 backdrop-blur-sm border-r p-3 z-10 transition-all ${
          collapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-indigo-600 text-white flex items-center justify-center font-semibold">A</div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold text-gray-800">Arithmos</div>
                <div className="text-xs text-gray-500">Payroll & HR</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2 rounded-md hover:bg-gray-100 transition"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <HiChevronRight className="w-5 h-5 text-gray-700" /> : <HiChevronLeft className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {LINKS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'} ${collapsed ? 'justify-center' : 'justify-start'}`
                }
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* <div className="mt-4">
          <button
            onClick={() => (window.location.href = '/logout')}
            className={`w-full text-sm text-left px-3 py-2 rounded-md transition ${collapsed ? 'text-gray-600' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            {!collapsed ? 'Sign out' : '⎋'}
          </button>
        </div> */}
      </aside>
    </>
  );
}