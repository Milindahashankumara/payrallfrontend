// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { FaCalculator, FaExclamationTriangle } from "react-icons/fa";

// // Helper functions
// const formatDate = (d) => {
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// };

// const sameDayPreviousMonth = (date) => {
//   const year = date.getFullYear();
//   const month = date.getMonth();
//   const day = date.getDate();
//   const prevMonthLastDay = new Date(year, month, 0).getDate();
//   const useDay = Math.min(day, prevMonthLastDay);
//   return new Date(year, month - 1, useDay);
// };

// // Searchable dropdown for employees
// function SearchableSelect({ items, valueId, onSelect, placeholder = "Select..." }) {
//   const [open, setOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const ref = useRef(null);

//   useEffect(() => {
//     const sel = items.find((i) => String(i.id) === String(valueId));
//     setInput(sel ? `${sel.fullName || sel.name} (${sel.employeeNumber || sel.id})` : "");
//   }, [valueId, items]);

//   useEffect(() => {
//     const onDoc = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, []);

//   const filtered = input
//     ? items.filter((it) =>
//         `${it.fullName || it.name} ${it.email || ""} ${it.employeeNumber || ""}`
//           .toLowerCase()
//           .includes(input.toLowerCase())
//       )
//     : items.slice(0, 8);

//   return (
//     <div ref={ref} className="relative">
//       <input
//         type="text"
//         role="combobox"
//         aria-expanded={open}
//         aria-controls="employee-list"
//         placeholder={placeholder}
//         value={input}
//         onChange={(e) => {
//           setInput(e.target.value);
//           setOpen(true);
//           if (valueId) onSelect("");
//         }}
//         onFocus={() => setOpen(true)}
//         className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       />
//       {open && (
//         <ul
//           id="employee-list"
//           role="listbox"
//           className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
//         >
//           {filtered.length ? (
//             filtered.map((it) => (
//               <li
//                 key={it.id}
//                 role="option"
//                 onMouseDown={(e) => {
//                   e.preventDefault();
//                   onSelect(it.id);
//                   setInput(`${it.fullName || it.name} (${it.employeeNumber || it.id})`);
//                   setOpen(false);
//                 }}
//                 className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
//               >
//                 <div className="font-medium">{it.fullName || it.name}</div>
//                 <div className="text-xs text-gray-500">{it.email || it.employeeNumber}</div>
//               </li>
//             ))
//           ) : (
//             <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
//           )}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default function GenerateSalary() {
//   // Default dates
//   const today = new Date();
//   const toDefault = formatDate(today);
//   const fromDefault = formatDate(sameDayPreviousMonth(today));

//   const [employees, setEmployees] = useState([]);
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     year: today.getFullYear(),
//     month: today.getMonth() + 1,
//     workingDays: 0,
//     incentives: 0,
//     bonus: 0,
//     salaryAdvances: 0,
//     loans: 0,
//     otherDeductions: 0,
//     leaveDays: 0,
//     halfDays: 0,
//     noPayDays: 0,
//     ot1Hours: 0,
//     ot2Hours: 0,
//     fromDate: fromDefault,
//     toDate: toDefault,
//   });
//   const [generatedReport, setGeneratedReport] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [employeeLoading, setEmployeeLoading] = useState(true);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const [activeLoan, setActiveLoan] = useState(null);
//   const [loanLoading, setLoanLoading] = useState(false);
//   const [holidayCount, setHolidayCount] = useState(0);
//   const [holidayLoading, setHolidayLoading] = useState(false);

//   // Fetch employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         setEmployeeLoading(true);
//         const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/employe`);
//         setEmployees(res.data || []);
//       } catch (err) {
//         showMessage("Failed to load employees", "error");
//       } finally {
//         setEmployeeLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // Fetch active loan when employee changes
//   useEffect(() => {
//     const fetchActiveLoan = async (employeeId) => {
//       try {
//         setLoanLoading(true);
//         const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loan/active/${employeeId}`);
//         if (res.data) {
//           setActiveLoan(res.data);
//           setFormData((prev) => ({
//             ...prev,
//             loans: res.data.monthlyInstallment,
//           }));
//         } else {
//           setActiveLoan(null);
//           setFormData((prev) => ({ ...prev, loans: 0 }));
//         }
//       } catch {
//         setActiveLoan(null);
//         setFormData((prev) => ({ ...prev, loans: 0 }));
//       } finally {
//         setLoanLoading(false);
//       }
//     };
//     if (formData.employeeId) {
//       fetchActiveLoan(formData.employeeId);
//     } else {
//       setActiveLoan(null);
//       setFormData((prev) => ({ ...prev, loans: 0 }));
//     }
//     // eslint-disable-next-line
//   }, [formData.employeeId]);

//   // Fetch holiday count when date range changes
//   useEffect(() => {
//     const fetchHolidayCount = async (fromDate, toDate) => {
//       if (!fromDate || !toDate) return;
      
//       try {
//         setHolidayLoading(true);
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_BASE_URL}/api/holiday/countnonweekend`,
//           { 
//             params: { 
//               startDate: fromDate,
//               endDate: toDate
//             } 
//           }
//         );
//         setHolidayCount(res.data || 0);
//       } catch (err) {
//         console.error("Error fetching holiday count:", err);
//         setHolidayCount(0);
//       } finally {
//         setHolidayLoading(false);
//       }
//     };

//     if (formData.fromDate && formData.toDate) {
//       fetchHolidayCount(formData.fromDate, formData.toDate);
//     }
//   }, [formData.fromDate, formData.toDate]);

//   // Fetch OT hours when employee or date range changes
//   useEffect(() => {
//     const fetchOtHours = async (employeeId, fromDate, toDate) => {
//       if (!employeeId || !fromDate || !toDate) return;
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime/sum/${employeeId}`,
//           { params: { fromDate, toDate } }
//         );
//         if (res.data) {
//           setFormData((prev) => ({
//             ...prev,
//             ot1Hours: res.data.totalOt1Hours || 0,
//             ot2Hours: res.data.totalOt2Hours || 0,
//           }));
//         }
//       } catch {
//         setFormData((prev) => ({
//           ...prev,
//           ot1Hours: 0,
//           ot2Hours: 0,
//         }));
//       }
//     };
//     if (formData.employeeId && formData.fromDate && formData.toDate) {
//       fetchOtHours(formData.employeeId, formData.fromDate, formData.toDate);
//     }
//     // eslint-disable-next-line
//   }, [formData.employeeId, formData.fromDate, formData.toDate]);

//   // Calculate working days when dates or holiday count changes
//   useEffect(() => {
//     if (formData.fromDate && formData.toDate) {
//       const fromDate = new Date(formData.fromDate);
//       const toDate = new Date(formData.toDate);
//       const businessDays = calculateBusinessDays(fromDate, toDate);
//       const finalWorkingDays = Math.max(0, businessDays - holidayCount);
      
//       setFormData((prev) => ({
//         ...prev,
//         workingDays: finalWorkingDays,
//       }));
//     }
//     // eslint-disable-next-line
//   }, [formData.fromDate, formData.toDate, holidayCount]);

//   function calculateBusinessDays(startDate, endDate) {
//     let count = 0;
//     const curDate = new Date(startDate.getTime());
//     while (curDate <= endDate) {
//       const dayOfWeek = curDate.getDay();
//       if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
//       curDate.setDate(curDate.getDate() + 1);
//     }
//     return count;
//   }

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     const val = type === "number" ? Number(value) : value;
//     setFormData((prev) => ({ ...prev, [name]: val }));
//   };

//   const handleDateChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };
  

//   const recordLoanRepayment = async (loanId, installmentAmount) => {
//     try {
//       const repaymentDto = {
//         loanId: loanId,
//         installmentAmount: installmentAmount,
//         paymentDate: new Date().toISOString(),
//         description: `Salary deduction for ${formatMonth(formData.month)} ${formData.year}`,
//       };
//       await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/loanrepayment/${loanId}/repayments`,
//         repaymentDto
//       );
//       return true;
//     } catch {
//       showMessage("Failed to record loan repayment", "error");
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (new Date(formData.fromDate) > new Date(formData.toDate)) {
//       showMessage("From date cannot be after to date", "error");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/calculations/generate`,
//         formData
//       );
//       setGeneratedReport(res.data);
//       if (activeLoan && formData.loans > 0) {
//         const repaymentSuccess = await recordLoanRepayment(activeLoan.id, formData.loans);
//         if (repaymentSuccess) {
//           showMessage("Salary report generated and loan repayment recorded successfully!", "success");
//         } else {
//           showMessage("Salary report generated but failed to record loan repayment", "warning");
//         }
//       } else {
//         showMessage("Salary report generated successfully!", "success");
//       }
//       setIsModalOpen(true);
//     } catch {
//       showMessage("Failed to generate salary report", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showMessage = (text, type) => {
//     setMessage({ text, type });
//     setTimeout(() => setMessage({ text: "", type: "" }), 5000);
//   };

//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount);

//   const formatMonth = (month) => {
//     const months = [
//       "January", "February", "March", "April", "May", "June",
//       "July", "August", "September", "October", "November", "December"
//     ];
//     return months[month - 1] || month;
//   };

//   const currentYear = today.getFullYear();
//   const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

//   return (
//     <div className="min-h-screen p-6 bg-gray-50">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">Generate Salary Report</h1>
//           <p className="text-sm text-gray-500 mt-1">Create new salary reports for employees.</p>
//         </div>

//         {/* Message Alert */}
//         {message.text && (
//           <div
//             className={`mb-6 p-4 rounded-lg ${
//               message.type === "success"
//                 ? "bg-green-100 text-green-800"
//                 : message.type === "warning"
//                 ? "bg-yellow-100 text-yellow-800"
//                 : "bg-red-100 text-red-800"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         {/* Form */}
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Employee Selection (searchable) */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
//                 {employeeLoading ? (
//                   <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 animate-pulse">Loading employees...</div>
//                 ) : (
//                   <SearchableSelect
//                     items={employees}
//                     valueId={formData.employeeId}
//                     onSelect={(id) => setFormData((prev) => ({ ...prev, employeeId: id }))}
//                     placeholder="Type name, email or employee number..."
//                   />
//                 )}
//               </div>

//               {/* Year & Month Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Year & Month
//                 </label>
//                 <input
//                   type="month"
//                   value={`${formData.year}-${String(formData.month).padStart(2, '0')}`}
//                   onChange={(e) => {
//                     const [year, month] = e.target.value.split('-');
//                     setFormData(prev => ({
//                       ...prev,
//                       year: parseInt(year, 10),
//                       month: parseInt(month, 10)
//                     }));
//                   }}
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* From Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
//                 <input
//                   type="date"
//                   name="fromDate"
//                   value={formData.fromDate}
//                   onChange={handleDateChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* To Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
//                 <input
//                   type="date"
//                   name="toDate"
//                   value={formData.toDate}
//                   onChange={handleDateChange}
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

              

//               {/* Leave Days */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Leave Days (Staff only)</label>
//                 <input
//                   type="number"
//                   name="leaveDays"
//                   value={formData.leaveDays}
//                   onChange={handleChange}
//                   min="0"
//                   max="31"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* Half Days */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Half Days (staff only)</label>
//                 <input
//                   type="number"
//                   name="halfDays"
//                   value={formData.halfDays}
//                   onChange={handleChange}
//                   min="0"
//                   max="31"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* No Pay Days */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">No Pay Days (Staff only)</label>
//                 <input
//                   type="number"
//                   name="noPayDays"
//                   value={formData.noPayDays}
//                   onChange={handleChange}
//                   min="0"
//                   max="31"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

              

//               {/* Incentives */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Incentives</label>
//                 <input
//                   type="number"
//                   name="incentives"
//                   value={formData.incentives}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* Bonus */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
//                 <input
//                   type="number"
//                   name="bonus"
//                   value={formData.bonus}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* Salary Advances */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Salary Advances</label>
//                 <input
//                   type="number"
//                   name="salaryAdvances"
//                   value={formData.salaryAdvances}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* Other Deductions */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
//                 <input
//                   type="number"
//                   name="otherDeductions"
//                   value={formData.otherDeductions}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   required
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               {/* OT1 Hours (auto-filled, read-only) */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Regular OT Hours (Staff only)</label>
//                 <input
//                   type="number"
//                   name="ot1Hours"
//                   value={formData.ot1Hours}
//                   onChange={handleChange} 
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Auto-filled from overtime records of seleted employee</p>
//               </div>

//               {/* OT2 Hours (auto-filled, read-only) */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Double OT Hours (Staff only)</label>
//                 <input
//                   type="number"
//                   name="ot2Hours"
//                   value={formData.ot2Hours}
//                   onChange={handleChange} 
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Auto-filled from overtime records of selected employee</p>
//               </div>

//               {/* Working Days with Holiday Info */}
//               <div className="md:col-span-2">
                
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
//                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
//   <div className="text-sm font-medium text-blue-800">
//     Total Selected Days: {
//       (() => {
//         const from = new Date(formData.fromDate);
//         const to = new Date(formData.toDate);
//         return from > to ? 0 : Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
//       })()
//     }
//   </div>
//   <div className="text-sm font-medium text-blue-800">
//     Total Weekends: {
//       (() => {
//         const from = new Date(formData.fromDate);
//         const to = new Date(formData.toDate);
//         let count = 0;
//         const cur = new Date(from);
//         while (cur <= to) {
//           if (cur.getDay() === 0 || cur.getDay() === 6) count++;
//           cur.setDate(cur.getDate() + 1);
//         }
//         return count;
//       })()
//     }
//   </div>
//   <div className="text-sm font-medium text-blue-800">
//     Business Days: {calculateBusinessDays(new Date(formData.fromDate), new Date(formData.toDate))}
//   </div>
//   <div className="text-sm font-medium text-blue-800">
//     {holidayLoading ? (
//       "Loading holidays..."
//     ) : (
//       `Non-weekend Holidays: ${holidayCount}`
//     )}
//   </div>
//   <div className="text-sm font-medium text-blue-800">
//     NoPay Days: {formData.noPayDays}
//   </div>

//   <p className="text-xs text-gray-500 mt-2">
//     Working days are automatically calculated from selected dates, excluding weekends and non-weekend holidays.
//   </p>
// </div>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <input
//                       type="number"
//                       name="workingDays"
//                       value={formData.workingDays}
//                       onChange={handleChange}
//                       min="0"
//                       max="31"
//                       required
//                       className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Final working days</p>
//                   </div>
//                 </div>
                
//               </div>

//               {/* Loans Section */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Loan Deductions</label>
//                 {loanLoading ? (
//                   <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 animate-pulse mb-3">
//                     Checking for active loans...
//                   </div>
//                 ) : activeLoan ? (
//                   <div className="col-span-2 p-4 bg-blue-50 border border-blue-300 rounded-md mb-4">
//                     <div className="flex items-center mb-2">
//                       <FaExclamationTriangle className="text-blue-500 mr-2" />
//                       <span className="font-medium text-blue-800">Active Loan Found</span>
//                     </div>
//                     <p className="text-sm text-gray-800">
//                       <span className="font-medium">Loan Amount:</span> {formatCurrency(activeLoan.principalAmount)}
//                       <br />
//                       <span className="font-medium">Remaining Balance:</span> {formatCurrency(activeLoan.remainingBalance)}
//                       <br />
//                       <span className="font-medium">Monthly Installment:</span> {formatCurrency(activeLoan.monthlyInstallment)}
//                     </p>
//                     <p className="text-xs text-gray-600 mt-1">
//                       The installment field below has been auto-filled, but you may adjust it. This amount will be recorded as a loan repayment.
//                     </p>
//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-500 mb-2">No active loans found for this employee.</p>
//                 )}
//                 <input
//                   type="number"
//                   name="loans"
//                   value={formData.loans}
//                   onChange={handleChange}
//                   min="0"
//                   step="0.01"
//                   required
//                   disabled={!activeLoan}
//                   className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
//                     !activeLoan ? "bg-gray-100 cursor-not-allowed" : ""
//                   }`}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Enter the amount to be deducted for loan repayments. This will be recorded as a repayment.
//                 </p>
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 disabled={loading || employeeLoading || !formData.employeeId}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
//               >
//                 {loading ? "Generating..." : <><FaCalculator /> Generate Report</>}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Report Preview Modal */}
//       {isModalOpen && generatedReport && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4">Salary Report Generated Successfully</h2>
//             <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

















import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaCalculator, FaExclamationTriangle } from "react-icons/fa";

// Helper functions
const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const sameDayPreviousMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const useDay = Math.min(day, prevMonthLastDay);
  return new Date(year, month - 1, useDay);
};

// Searchable dropdown for employees
function SearchableSelect({ items, valueId, onSelect, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const sel = items.find((i) => String(i.id) === String(valueId));
    setInput(sel ? `${sel.fullName || sel.name} (${sel.employeeNumber || sel.id})` : "");
  }, [valueId, items]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = input
    ? items.filter((it) =>
        `${it.fullName || it.name} ${it.email || ""} ${it.employeeNumber || ""}`
          .toLowerCase()
          .includes(input.toLowerCase())
      )
    : items.slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="employee-list"
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          if (valueId) onSelect("");
        }}
        onFocus={() => setOpen(true)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {open && (
        <ul
          id="employee-list"
          role="listbox"
          className="absolute z-40 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filtered.length ? (
            filtered.map((it) => (
              <li
                key={it.id}
                role="option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(it.id);
                  setInput(`${it.fullName || it.name} (${it.employeeNumber || it.id})`);
                  setOpen(false);
                }}
                className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
              >
                <div className="font-medium">{it.fullName || it.name}</div>
                <div className="text-xs text-gray-500">{it.email || it.employeeNumber}</div>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function GenerateSalary() {
  // Default dates - calculate first and last day of current month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  
  // First day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  // Last day of current month
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
  
  const fromDefault = formatDate(firstDayOfMonth);
  const toDefault = formatDate(lastDayOfMonth);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Store selected employee details
  const [otRates, setOtRates] = useState({ ot1Rate: 0, ot2Rate: 0 }); // Store OT rates
  const [formData, setFormData] = useState({
    employeeId: "",
    year: currentYear,
    month: currentMonth,
    workingDays: "",
    incentives: "",
    bonus: "",
    salaryAdvances: "",
    loans: "",
    otherDeductions: "",
    leaveDays: "",
    halfDays: "",
    noPayDays: "",
    ot1Hours: "",
    ot2Hours: "",
    fromDate: fromDefault,
    toDate: toDefault,
    attendanceAllowance : "",
    transportAllowance : "",
    foodAllowance : "",
    medicalAllowance : "",
    internetAllowance : "",
    kpiRate: "",
    kpiAmount: "",
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeLoan, setActiveLoan] = useState(null);
  const [loanLoading, setLoanLoading] = useState(false);
  const [holidayCount, setHolidayCount] = useState(0);
  const [holidayLoading, setHolidayLoading] = useState(false);
  
  // New states for OT tracking
  const [originalOt1Hours, setOriginalOt1Hours] = useState(0);
  const [originalOt2Hours, setOriginalOt2Hours] = useState(0);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeeLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/employees?pageSize=1000`);
        console.log("Fetched employees for salary generation:", res.data.length);
        setEmployees(res.data || []);
      } catch (err) {
        console.error("Failed to load employees:", err);
        showMessage("Failed to load employees", "error");
      } finally {
        setEmployeeLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch OT rates on component mount
  useEffect(() => {
    const fetchOtRates = async () => {
      try {
        const [ot1Res, ot2Res] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ot/2`), // Regular OT
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ot/1`)  // Double OT
        ]);
        setOtRates({
          ot1Rate: ot1Res.data?.rate || 0,
          ot2Rate: ot2Res.data?.rate || 0
        });
      } catch (err) {
        console.error("Failed to fetch OT rates:", err);
      }
    };
    fetchOtRates();
  }, []);

  // Fetch selected employee details when employee changes
  useEffect(() => {
    const fetchEmployeeDetails = async (employeeId) => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/employees/${employeeId}`);
        setSelectedEmployee(res.data);
        
        // Prefill KPI Amount and KPI Rate from employee record
        setFormData((prev) => ({
          ...prev,
          kpiAmount: res.data.kpiAmount || "",
          kpiRate: res.data.kpiRate || "",
        }));
      } catch (err) {
        console.error("Failed to fetch employee details:", err);
        setSelectedEmployee(null);
      }
    };
    
    if (formData.employeeId) {
      fetchEmployeeDetails(formData.employeeId);
    } else {
      setSelectedEmployee(null);
      // Clear KPI fields when no employee is selected
      setFormData((prev) => ({
        ...prev,
        kpiAmount: "",
        kpiRate: "",
      }));
    }
  }, [formData.employeeId]);

  // Fetch active loan when employee changes
  useEffect(() => {
    const fetchActiveLoan = async (employeeId) => {
      try {
        setLoanLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loan/active/${employeeId}`);
        if (res.data) {
          setActiveLoan(res.data);
          setFormData((prev) => ({
            ...prev,
            loans: res.data.monthlyInstallment,
          }));
        } else {
          setActiveLoan(null);
          setFormData((prev) => ({ ...prev, loans: "" }));
        }
      } catch {
        setActiveLoan(null);
        setFormData((prev) => ({ ...prev, loans: "" }));
      } finally {
        setLoanLoading(false);
      }
    };
    if (formData.employeeId) {
      fetchActiveLoan(formData.employeeId);
    } else {
      setActiveLoan(null);
      setFormData((prev) => ({ ...prev, loans: "" }));
    }
    // eslint-disable-next-line
  }, [formData.employeeId]);

  // Fetch holiday count when date range changes
  useEffect(() => {
    const fetchHolidayCount = async (fromDate, toDate) => {
      if (!fromDate || !toDate) return;
      
      try {
        setHolidayLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/specialHolidays/countnonweekend`,
          { 
            params: { 
              startDate: fromDate,
              endDate: toDate
            } 
          }
        );
        setHolidayCount(res.data || 0);
      } catch (err) {
        console.error("Error fetching holiday count:", err);
        setHolidayCount(0);
      } finally {
        setHolidayLoading(false);
      }
    };

    if (formData.fromDate && formData.toDate) {
      fetchHolidayCount(formData.fromDate, formData.toDate);
    }
  }, [formData.fromDate, formData.toDate]);

  // Fetch OT hours when employee or date range changes
  useEffect(() => {
    const fetchOtHours = async (employeeId, fromDate, toDate) => {
      if (!employeeId || !fromDate || !toDate) return;
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime/sum/${employeeId}`,
          { params: { fromDate, toDate } }
        );
        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            ot1Hours: res.data.totalOt1Hours || "",
            ot2Hours: res.data.totalOt2Hours || "",
          }));
          // Store original values for comparison
          setOriginalOt1Hours(res.data.totalOt1Hours || 0);
          setOriginalOt2Hours(res.data.totalOt2Hours || 0);
        }
      } catch {
        setFormData((prev) => ({
          ...prev,
          ot1Hours: "",
          ot2Hours: "",
        }));
        setOriginalOt1Hours(0);
        setOriginalOt2Hours(0);
      }
    };
    if (formData.employeeId && formData.fromDate && formData.toDate) {
      fetchOtHours(formData.employeeId, formData.fromDate, formData.toDate);
    }
    // eslint-disable-next-line
  }, [formData.employeeId, formData.fromDate, formData.toDate]);

  // Auto-calculate incentive for STAFF employees only
  useEffect(() => {
    if (!selectedEmployee) return;

    // Check if employee is day-salary-based (casual) - skip calculation for them
    const isDaySalaryBased = selectedEmployee.employeeCategories?.daySalarybased ?? false;
    if (isDaySalaryBased) {
      // Casual employees: incentive is manual input
      return;
    }

    // STAFF employee: Auto-calculate incentive
    try {
      const totalCompensation = parseFloat(selectedEmployee.totalCompensation) || 0;
      
      // Calculate Basic Salary (including BRA1 + BRA2)
      const basicSalary = (parseFloat(selectedEmployee.basicSalary) || 0) 
                        + (parseFloat(selectedEmployee.bra1) || 0) 
                        + (parseFloat(selectedEmployee.bra2) || 0);
      
      // Calculate NoPay deduction
      const noPayDays = parseFloat(formData.noPayDays) || 0;
      const noPay = (noPayDays * basicSalary) / 30;
      
      // EPF Liable Salary = Basic Salary - NoPay
      const epfLiableSalary = basicSalary - noPay;
      
      // Calculate OT Payment
      const ot1Hours = parseFloat(formData.ot1Hours) || 0;
      const ot2Hours = parseFloat(formData.ot2Hours) || 0;
      const ot1Payment = (basicSalary / 240) * otRates.ot1Rate * ot1Hours;
      const ot2Payment = (basicSalary / 240) * otRates.ot2Rate * ot2Hours;
      const totalOtPayment = ot1Payment + ot2Payment;
      
      // KPI Allowance - Always use user input from form data
      const kpiAllowance = parseFloat(formData.kpiAmount) || 0;
      
      // Get all allowances
      const attendanceAllowance = parseFloat(formData.attendanceAllowance) || 0;
      const transportAllowance = parseFloat(formData.transportAllowance) || 0;
      const foodAllowance = parseFloat(formData.foodAllowance) || 0;
      const medicalAllowance = parseFloat(formData.medicalAllowance) || 0;
      const internetAllowance = parseFloat(formData.internetAllowance) || 0;
      
      // Calculate Incentive
      // Formula: Incentive = TotalCompensation - (TotalOTPayment + BasicSalary + KPIAllowance + Allowances)
      const calculatedIncentive = totalCompensation 
        - totalOtPayment 
        - basicSalary 
        - kpiAllowance
        - attendanceAllowance
        - transportAllowance
        - foodAllowance
        - medicalAllowance
        - internetAllowance;
      
      // Clamp to 0 if negative
      const finalIncentive = Math.max(0, calculatedIncentive);
      
      setFormData((prev) => ({
        ...prev,
        incentives: finalIncentive.toFixed(2)
      }));
    } catch (error) {
      console.error("Error calculating incentive:", error);
    }
  }, [
    selectedEmployee,
    formData.ot1Hours,
    formData.ot2Hours,
    formData.noPayDays,
    formData.kpiAmount,
    formData.attendanceAllowance,
    formData.transportAllowance,
    formData.foodAllowance,
    formData.medicalAllowance,
    formData.internetAllowance,
    otRates
  ]);

  // Calculate working days when dates or holiday count changes
  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      const businessDays = calculateBusinessDays(fromDate, toDate);
      const finalWorkingDays = Math.max(0, businessDays - holidayCount);
      
      setFormData((prev) => ({
        ...prev,
        workingDays: finalWorkingDays,
      }));
    }
    // eslint-disable-next-line
  }, [formData.fromDate, formData.toDate, holidayCount]);

  function calculateBusinessDays(startDate, endDate) {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to create overtime record
  const createOvertimeRecord = async (employeeId, otType, hours, fromDate, toDate) => {
    try {
      const overtimeDto = {
        employeId: employeeId,
        otId: otType, // 1 for double OT, 2 for regular OT (based on your backend)
        dateWorked: new Date().toISOString().split('T')[0], // Today's date
        hoursWorked: hours,
        remarks: `Manual OT entry from salary generation for ${formatMonth(formData.month)} ${formData.year} (${fromDate} to ${toDate})`
      };

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime`,
        overtimeDto
      );
      return true;
    } catch (error) {
      console.error(`Failed to create ${otType === 2 ? 'regular' : 'double'} OT record:`, error);
      return false;
    }
  };

  // Function to create additional overtime records
  const createAdditionalOvertimeRecords = async () => {
    const additionalOt1 = Math.max(0, formData.ot1Hours - originalOt1Hours);
    const additionalOt2 = Math.max(0, formData.ot2Hours - originalOt2Hours);
    
    let success = true;
    let createdRecords = [];
    
    // Create regular OT record if additional hours were added (OT Type 2)
    if (additionalOt1 > 0) {
      const ot1Success = await createOvertimeRecord(
        formData.employeeId,
        2, // Regular OT (Type 2)
        additionalOt1,
        formData.fromDate,
        formData.toDate
      );
      if (ot1Success) {
        createdRecords.push(`${additionalOt1} regular OT hours`);
      }
      if (!ot1Success) success = false;
    }
    
    // Create double OT record if additional hours were added (OT Type 1)
    if (additionalOt2 > 0) {
      const ot2Success = await createOvertimeRecord(
        formData.employeeId,
        1, // Double OT (Type 1)
        additionalOt2,
        formData.fromDate,
        formData.toDate
      );
      if (ot2Success) {
        createdRecords.push(`${additionalOt2} double OT hours`);
      }
      if (!ot2Success) success = false;
    }
    
    return { success, createdRecords };
  };

  const recordLoanRepayment = async (loanId, installmentAmount) => {
    try {
      const repaymentDto = {
        loanId: loanId,
        installmentAmount: installmentAmount,
        paymentDate: new Date().toISOString(),
        description: `Salary deduction for ${formatMonth(formData.month)} ${formData.year}`,
      };
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/loanrepayment/${loanId}/repayments`,
        repaymentDto
      );
      return true;
    } catch {
      showMessage("Failed to record loan repayment", "error");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      showMessage("From date cannot be after to date", "error");
      return;
    }
    setLoading(true);
    try {
      // Convert empty strings to 0 for calculations and submission
      const numericFormData = {
        ...formData,
        workingDays: formData.workingDays === "" ? 0 : Number(formData.workingDays),
        incentives: formData.incentives === "" ? 0 : Number(formData.incentives),
        bonus: formData.bonus === "" ? 0 : Number(formData.bonus),
        salaryAdvances: formData.salaryAdvances === "" ? 0 : Number(formData.salaryAdvances),
        loans: formData.loans === "" ? 0 : Number(formData.loans),
        otherDeductions: formData.otherDeductions === "" ? 0 : Number(formData.otherDeductions),
        leaveDays: formData.leaveDays === "" ? 0 : Number(formData.leaveDays),
        halfDays: formData.halfDays === "" ? 0 : Number(formData.halfDays),
        noPayDays: formData.noPayDays === "" ? 0 : Number(formData.noPayDays),
        ot1Hours: formData.ot1Hours === "" ? 0 : Number(formData.ot1Hours),
        ot2Hours: formData.ot2Hours === "" ? 0 : Number(formData.ot2Hours),
        attendanceAllowance: formData.attendanceAllowance === "" ? 0 : Number(formData.attendanceAllowance),
        transportAllowance: formData.transportAllowance === "" ? 0 : Number(formData.transportAllowance),
        foodAllowance: formData.foodAllowance === "" ? 0 : Number(formData.foodAllowance),
        medicalAllowance: formData.medicalAllowance === "" ? 0 : Number(formData.medicalAllowance),
        internetAllowance: formData.internetAllowance === "" ? 0 : Number(formData.internetAllowance),
        kpiRate: formData.kpiRate === "" ? 0 : Number(formData.kpiRate),
        kpiAmount: formData.kpiAmount === "" ? 0 : Number(formData.kpiAmount),
      };

      // Debug logging - DETAILED
      console.log('[DEBUG FRONTEND] ==========================================');
      console.log('[DEBUG FRONTEND] Raw formData.kpiRate:', formData.kpiRate);
      console.log('[DEBUG FRONTEND] Raw formData.kpiAmount:', formData.kpiAmount);
      console.log('[DEBUG FRONTEND] Type of formData.kpiRate:', typeof formData.kpiRate);
      console.log('[DEBUG FRONTEND] Type of formData.kpiAmount:', typeof formData.kpiAmount);
      console.log('[DEBUG FRONTEND] Converted kpiRate:', numericFormData.kpiRate);
      console.log('[DEBUG FRONTEND] Converted kpiAmount:', numericFormData.kpiAmount);
      console.log('[DEBUG FRONTEND] Type after conversion kpiRate:', typeof numericFormData.kpiRate);
      console.log('[DEBUG FRONTEND] Type after conversion kpiAmount:', typeof numericFormData.kpiAmount);
      console.log('[DEBUG FRONTEND] Full numericFormData:', JSON.stringify(numericFormData, null, 2));
      console.log('[DEBUG FRONTEND] ==========================================');

      // Check if additional OT hours were added and create records
      const additionalOt1 = Math.max(0, numericFormData.ot1Hours - originalOt1Hours);
      const additionalOt2 = Math.max(0, numericFormData.ot2Hours - originalOt2Hours);
      
      let otCreationResult = { success: true, createdRecords: [] };
      let otCreationMessage = "";
      
      if (additionalOt1 > 0 || additionalOt2 > 0) {
        otCreationResult = await createAdditionalOvertimeRecords();
        if (otCreationResult.success && otCreationResult.createdRecords.length > 0) {
          otCreationMessage = ` and created ${otCreationResult.createdRecords.join(', ')}`;
        } else if (!otCreationResult.success) {
          otCreationMessage = " but failed to create additional OT records";
        }
      }

      // Generate the salary report
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/calculations/generate`,
        numericFormData
      );
      
      // Debug: Log the complete response
      console.log('[DEBUG FRONTEND RESPONSE] ==========================================');
      console.log('[DEBUG FRONTEND RESPONSE] Full response:', res.data);
      console.log('[DEBUG FRONTEND RESPONSE] Response IsDaySalaryBased:', res.data.isDaySalaryBased);
      console.log('[DEBUG FRONTEND RESPONSE] Response DaySalary:', res.data.daySalary);
      console.log('[DEBUG FRONTEND RESPONSE] Response KPI Rate:', res.data.kpiRate);
      console.log('[DEBUG FRONTEND RESPONSE] Response KPI Allowance:', res.data.kpiAllowance);
      console.log('[DEBUG FRONTEND RESPONSE] Response type:', typeof res.data.kpiAllowance);
      console.log('[DEBUG FRONTEND RESPONSE] Response Incentives:', res.data.incentives);
      console.log('[DEBUG FRONTEND RESPONSE] Response GrossSalary:', res.data.grossSalary);
      console.log('[DEBUG FRONTEND RESPONSE] ==========================================');
      
      setGeneratedReport(res.data);
      
      // Handle loan repayment
      let loanMessage = "";
      if (activeLoan && numericFormData.loans > 0) {
        const repaymentSuccess = await recordLoanRepayment(activeLoan.id, numericFormData.loans);
        if (repaymentSuccess) {
          loanMessage = " and loan repayment recorded";
        } else {
          loanMessage = " but failed to record loan repayment";
        }
      }

      // Show appropriate message
      const hasWarnings = !otCreationResult.success || loanMessage.includes("failed");
      showMessage(
        `Salary report generated successfully!${otCreationMessage}${loanMessage}`,
        hasWarnings ? "warning" : "success"
      );
      
      setIsModalOpen(true);
    } catch {
      showMessage("Failed to generate salary report", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const formatMonth = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || month;
  };

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Calculate additional hours for display
  const additionalOt1Hours = Math.max(0, (formData.ot1Hours === "" ? 0 : Number(formData.ot1Hours)) - originalOt1Hours);
  const additionalOt2Hours = Math.max(0, (formData.ot2Hours === "" ? 0 : Number(formData.ot2Hours)) - originalOt2Hours);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Generate Salary Report</h1>
          <p className="text-sm text-gray-500 mt-1">Create new salary reports for employees.</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : message.type === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection (searchable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                {employeeLoading ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 animate-pulse">Loading employees...</div>
                ) : (
                  <SearchableSelect
                    items={employees}
                    valueId={formData.employeeId}
                    onSelect={(id) => setFormData((prev) => ({ ...prev, employeeId: id }))}
                    placeholder="Type name, email or employee number..."
                  />
                )}
              </div>

              {/* Year & Month Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year & Month
                </label>
                <input
                  type="month"
                  value={`${formData.year}-${String(formData.month).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    const selectedYear = parseInt(year, 10);
                    const selectedMonth = parseInt(month, 10);
                    
                    // Calculate first day of the month
                    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
                    
                    // Calculate last day of the month (handles all month lengths including leap years)
                    const lastDay = new Date(selectedYear, selectedMonth, 0);
                    
                    // Format dates as YYYY-MM-DD for input[type="date"]
                    const fromDate = formatDate(firstDay);
                    const toDate = formatDate(lastDay);
                    
                    setFormData(prev => ({
                      ...prev,
                      year: selectedYear,
                      month: selectedMonth,
                      fromDate: fromDate,
                      toDate: toDate
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                  <span className="text-xs text-gray-500 ml-2">(Auto-filled from Year & Month)</span>
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleDateChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                  <span className="text-xs text-gray-500 ml-2">(Auto-filled from Year & Month)</span>
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleDateChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Leave Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Days (Staff only)</label>
                <input
                  type="number"
                  name="leaveDays"
                  value={formData.leaveDays}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  autoComplete="off"
                  placeholder="Enter leave days"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Half Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Half Days (staff only)</label>
                <input
                  type="number"
                  name="halfDays"
                  value={formData.halfDays}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  autoComplete="off"
                  placeholder="Enter half days"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* No Pay Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No Pay Days (Staff only)</label>
                <input
                  type="number"
                  name="noPayDays"
                  value={formData.noPayDays}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  autoComplete="off"
                  placeholder="Enter no pay days"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Incentives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incentives
                  {selectedEmployee && !(selectedEmployee.employeeCategories?.daySalarybased ?? false) && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Auto-calculated for Staff
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="incentives"
                  value={formData.incentives}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  readOnly={selectedEmployee && !(selectedEmployee.employeeCategories?.daySalarybased ?? false)}
                  placeholder={
                    selectedEmployee && !(selectedEmployee.employeeCategories?.daySalarybased ?? false)
                      ? "Auto-calculated"
                      : "Enter incentive amount"
                  }
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    selectedEmployee && !(selectedEmployee.employeeCategories?.daySalarybased ?? false)
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {/* Bonus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                <input
                  type="number"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter bonus amount"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* AttendanceAllowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Allowance</label>
                <input
                  type="number"
                  name="attendanceAllowance"
                  value={formData.attendanceAllowance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter attendance allowance"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Transport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transport Allowance</label>
                <input
                  type="number"
                  name="transportAllowance"
                  value={formData.transportAllowance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter transport allowance"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Food Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Allowance</label>
                <input
                  type="number"
                  name="foodAllowance"
                  value={formData.foodAllowance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter food allowance"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Medical Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Allowance</label>
                <input
                  type="number"
                  name="medicalAllowance"
                  value={formData.medicalAllowance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter medical allowance"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Internet Allowance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internet Allowance</label>
                <input
                  type="number"
                  name="internetAllowance"
                  value={formData.internetAllowance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter internet allowance"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* KPI Rate (Casual Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI Rate (Casual Only)</label>
                <input
                  type="number"
                  name="kpiRate"
                  value={formData.kpiRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter KPI rate"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* KPI Allowance (Staff Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI Allowance (Staff Only)</label>
                <input
                  type="number"
                  name="kpiAmount"
                  value={formData.kpiAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter KPI allowance"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Salary Advances */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Advances</label>
                <input
                  type="number"
                  name="salaryAdvances"
                  value={formData.salaryAdvances}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter salary advance amount"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Other Deductions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
                <input
                  type="number"
                  name="otherDeductions"
                  value={formData.otherDeductions}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  autoComplete="off"
                  placeholder="Enter other deductions"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* OT1 Hours (auto-filled, but editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular OT Hours (Staff only)
                  {additionalOt1Hours > 0 && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      +{additionalOt1Hours} additional hours
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="ot1Hours"
                  value={formData.ot1Hours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  autoComplete="off"
                  placeholder="Enter OT hours"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled: {originalOt1Hours} hours. Additional hours will create new OT records.
                </p>
              </div>

              {/* OT2 Hours (auto-filled, but editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Double OT Hours (Staff only)
                  {additionalOt2Hours > 0 && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      +{additionalOt2Hours} additional hours
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="ot2Hours"
                  value={formData.ot2Hours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  autoComplete="off"
                  placeholder="Enter double OT hours"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-filled: {originalOt2Hours} hours. Additional hours will create new OT records.
                </p>
              </div>

              {/* Working Days with Holiday Info */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm font-medium text-blue-800">
                    Total Selected Days: {
                      (() => {
                        const from = new Date(formData.fromDate);
                        const to = new Date(formData.toDate);
                        return from > to ? 0 : Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
                      })()
                    }
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    Total Weekends: {
                      (() => {
                        const from = new Date(formData.fromDate);
                        const to = new Date(formData.toDate);
                        let count = 0;
                        const cur = new Date(from);
                        while (cur <= to) {
                          if (cur.getDay() === 0 || cur.getDay() === 6) count++;
                          cur.setDate(cur.getDate() + 1);
                        }
                        return count;
                      })()
                    }
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    Business Days: {calculateBusinessDays(new Date(formData.fromDate), new Date(formData.toDate))}
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    {holidayLoading ? (
                      "Loading holidays..."
                    ) : (
                      `Non-weekend Holidays: ${holidayCount}`
                    )}
                  </div>
                  <div className="text-sm font-medium text-blue-800">
                    NoPay Days: {formData.noPayDays === "" ? 0 : formData.noPayDays}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Working days are automatically calculated from selected dates, excluding weekends and non-weekend holidays.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      name="workingDays"
                      value={formData.workingDays}
                      onChange={handleChange}
                      min="0"
                      max="31"
                      autoComplete="off"
                      placeholder="Working days"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Final working days</p>
                  </div>
                </div>
              </div>

              {/* Loans Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Deductions</label>
                {loanLoading ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 animate-pulse mb-3">
                    Checking for active loans...
                  </div>
                ) : activeLoan ? (
                  <div className="col-span-2 p-4 bg-blue-50 border border-blue-300 rounded-md mb-4">
                    <div className="flex items-center mb-2">
                      <FaExclamationTriangle className="text-blue-500 mr-2" />
                      <span className="font-medium text-blue-800">Active Loan Found</span>
                    </div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Loan Amount:</span> {formatCurrency(activeLoan.principalAmount)}
                      <br />
                      <span className="font-medium">Remaining Balance:</span> {formatCurrency(activeLoan.remainingBalance)}
                      <br />
                      <span className="font-medium">Monthly Installment:</span> {formatCurrency(activeLoan.monthlyInstallment)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      The installment field below has been auto-filled, but you may adjust it. This amount will be recorded as a loan repayment.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-2">No active loans found for this employee.</p>
                )}
                <input
                  type="number"
                  name="loans"
                  value={formData.loans}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  disabled={!activeLoan}
                  autoComplete="off"
                  placeholder="Enter loan deduction amount"
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !activeLoan ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the amount to be deducted for loan repayments. This will be recorded as a repayment.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || employeeLoading || !formData.employeeId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loading ? "Generating..." : <><FaCalculator /> Generate Report</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Report Preview Modal */}
      {isModalOpen && generatedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Salary Report Generated Successfully</h2>
            
            {/* Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Employee Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Employee Number:</span> {generatedReport.employeeNumber}</p>
                  <p><span className="font-medium">Employee Name:</span> {generatedReport.employeeName}</p>
                  <p><span className="font-medium">Employee Category:</span> {generatedReport.categaryName}</p>
                  <p><span className="font-medium">Department:</span> {generatedReport.departmentName}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Salary Summary</h3>
                <div className="space-y-2 text-sm">
                  {!generatedReport.isDaySalaryBased && (
                    <p><span className="font-medium">EPF Liable Salary:</span> Rs. {generatedReport.epfLiableSalary?.toLocaleString()}</p>
                  )}
                  <p><span className="font-medium">Gross Salary:</span> Rs. {generatedReport.grossSalary?.toLocaleString()}</p>
                  <p><span className="font-medium">Net Salary:</span> <span className="font-semibold text-green-600">Rs. {generatedReport.netSalary?.toLocaleString()}</span></p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Earnings</h3>
                <div className="space-y-2 text-sm">
                  {generatedReport.isDaySalaryBased ? (
                    <>
                      <p><span className="font-medium">Day Salary:</span> Rs. {generatedReport.daySalary?.toLocaleString()}</p>
                      <p><span className="font-medium">KPI Rate:</span> Rs. {generatedReport.kpiRate?.toLocaleString()}</p>
                      <p><span className="font-medium">Wages:</span> Rs. {generatedReport.wages?.toLocaleString()}</p>
                      <p><span className="font-medium">KPI Allowance:</span> Rs. {generatedReport.kpiAllowance?.toLocaleString()}</p>
                    </>
                  ) : (
                    <>
                      <p><span className="font-medium">Basic Salary:</span> Rs. {generatedReport.basicSala?.toLocaleString()}</p>
                      <p><span className="font-medium">BRA 1:</span> Rs. {generatedReport.bra1?.toLocaleString()}</p>
                      <p><span className="font-medium">BRA 2:</span> Rs. {generatedReport.bra2?.toLocaleString()}</p>
                      <p><span className="font-medium">KPI Allowance:</span> <span className="font-semibold text-blue-600">Rs. {generatedReport.kpiAllowance?.toLocaleString()}</span></p>
                      <p><span className="font-medium">Incentives:</span> <span className="font-semibold text-blue-600">Rs. {generatedReport.incentives?.toLocaleString()}</span></p>
                      <p><span className="font-medium">OT Payment:</span> Rs. {generatedReport.totalOtPayment?.toLocaleString()}</p>
                    </>
                  )}
                  <p><span className="font-medium">Bonus:</span> Rs. {generatedReport.bonus?.toLocaleString()}</p>
                  <p><span className="font-medium">Attendance Allowance:</span> Rs. {generatedReport.attendanceAllowance?.toLocaleString()}</p>
                  <p><span className="font-medium">Transport Allowance:</span> Rs. {generatedReport.transportAllowance?.toLocaleString()}</p>
                  <p><span className="font-medium">Food Allowance:</span> Rs. {generatedReport.foodAllowance?.toLocaleString()}</p>
                  <p><span className="font-medium">Medical Allowance:</span> Rs. {generatedReport.medicalAllowance?.toLocaleString()}</p>
                  <p><span className="font-medium">Internet Allowance:</span> Rs. {generatedReport.internetAllowance?.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Salary Advances:</span> Rs. {generatedReport.salaryAdvances?.toLocaleString()}</p>
                  <p><span className="font-medium">Loans:</span> Rs. {generatedReport.loans?.toLocaleString()}</p>
                  <p><span className="font-medium">Other Deductions:</span> Rs. {generatedReport.otherDeductions?.toLocaleString()}</p>
                  <p><span className="font-medium">Total Deductions:</span> Rs. {generatedReport.totalDeductions?.toLocaleString()}</p>
                  {!generatedReport.isDaySalaryBased && (
                    <>
                      <p><span className="font-medium">No Pay:</span> Rs. {generatedReport.noPay?.toLocaleString()}</p>
                      <p><span className="font-medium">EPF (Employee):</span> Rs. {generatedReport.epf1?.toLocaleString()}</p>
                      <p><span className="font-medium">EPF (Employer):</span> Rs. {generatedReport.epf2?.toLocaleString()}</p>
                      <p><span className="font-medium">ETF:</span> Rs. {generatedReport.etf?.toLocaleString()}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}