import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaEye, FaDownload, FaPrint, FaFilter, FaSearch, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SalaryReports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();
  const printRef = useRef();

  useEffect(() => {
    fetchSalaryReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filterYear, filterMonth]);

  const fetchSalaryReports = async () => {
    try {
      setLoading(true);
      console.log('[SALARY REPORTS] Fetching from:', `${process.env.REACT_APP_API_BASE_URL}/api/calculations/salaryreports`);
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/calculations/salaryreports`);
      console.log('[SALARY REPORTS] Response received:', res.data);
      console.log('[SALARY REPORTS] Number of reports:', res.data?.length || 0);
      setReports(res.data);
      setLoading(false);
    } catch (err) {
      console.error("[SALARY REPORTS] Error fetching salary reports:", err);
      console.error("[SALARY REPORTS] Error details:", err.response?.data || err.message);
      setLoading(false);
    }
  };

  const filterReports = () => {
    let result = reports;

    if (searchTerm) {
      result = result.filter(report => 
        report.employeeId.toString().includes(searchTerm) ||
        report.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.Employee && (
          (report.Employee.firstName && report.Employee.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (report.Employee.lastName && report.Employee.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (report.Employee.fullName && report.Employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        ))
      );
    }

    if (filterYear) {
      result = result.filter(report => report.year.toString() === filterYear);
    }

    if (filterMonth) {
      result = result.filter(report => report.month.toString() === filterMonth);
    }

    setFilteredReports(result);
  };

  const deleteReport = async (reportId, reportName) => {
    if (!window.confirm(`Are you sure you want to delete the salary report for ${reportName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/calculations/${reportId}`);
      
      // Remove the report from the local state
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      
      // Close modal if the deleted report is currently open
      if (selectedReport && selectedReport.id === reportId) {
        setIsModalOpen(false);
        setSelectedReport(null);
      }
      
      // Show success message
      alert("Salary report deleted successfully!");
    } catch (error) {
      console.error("Error deleting salary report:", error);
      alert("Failed to delete salary report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const generatePDF = async (report) => {
    const input = reportRef.current;
    
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf;
  };

  const generatePrintPDF = async (report) => {
    const input = printRef.current;
    
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf;
  };

  const downloadReport = async (report) => {
    try {
      setSelectedReport(report);
      setTimeout(async () => {
        const pdf = await generatePDF(report);
        pdf.save(`Salary_Report_${report.employeeName}_${formatMonth(report.month)}_${report.year}.pdf`);
      }, 500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const printReport = async (report) => {
    try {
      setSelectedReport(report);
      setTimeout(async () => {
        const pdf = await generatePrintPDF(report);
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        
        printWindow.onload = function() {
          printWindow.print();
        };
      }, 500);
    } catch (error) {
      console.error("Error printing report:", error);
      alert("Failed to print report. Please try again.");
    }
  };

  const formatMonth = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || month;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Original PDF Template for Download
  const PDFTemplate = ({ report }) => (
    <div ref={reportRef} className="p-6 bg-white" style={{ width: '794px', minHeight: '1123px' }}>
      <h2 className="text-xl font-bold mb-4">Salary Report Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Employee Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Report ID:</span> {report.id}</p>
            <p><span className="font-medium">Employee Number:</span> {report.employeeNumber}</p>
            <p><span className="font-medium">Employee Name:</span> {report.employeeName}</p>
            <p><span className="font-medium">Employee Category:</span> {report.categaryName}</p>
            <p><span className="font-medium">Employee Department:</span> {report.departmentName}</p>
            <p><span className="font-medium">Job Role:</span> {report.jobRoleName || 'N/A'}</p>
            <p><span className="font-medium">Period:</span> {formatMonth(report.month)} {report.year}</p>
            <p><span className="font-medium">Date Range:</span> {new Date(report.fromDate).toLocaleDateString()} to {new Date(report.toDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Generated On:</span> {new Date(report.generatedOn).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Salary Summary</h3>
          <div className="space-y-2 text-sm">
            {!report.isDaySalaryBased && (
              <p><span className="font-medium">EPF Liable Salary:</span> {formatCurrency(report.epfLiableSalary)}</p>
            )}
            <p><span className="font-medium">Gross Salary:</span> {formatCurrency(report.grossSalary)}</p>
            <p><span className="font-medium">Net Salary:</span> <span className="font-semibold text-green-600">{formatCurrency(report.netSalary)}</span></p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Earnings</h3>
          <div className="space-y-2 text-sm">
            {report.isDaySalaryBased && (
              <>
                <p><span className="font-medium">Day Salary:</span> {formatCurrency(report.daySalary)}</p>
                <p><span className="font-medium">KPI Rate:</span> {formatCurrency(report.kpiRate)}</p>
                <p><span className="font-medium">Wages:</span> {formatCurrency(report.wages)}</p>
              </>
            )}
            {!report.isDaySalaryBased && (
              <>
                <p><span className="font-medium">Basic Statutory Salary:</span> {formatCurrency(report.basicStationarySal)}</p>
                <p><span className="font-medium">BRA 1:</span> {formatCurrency(report.bra1)}</p>
                <p><span className="font-medium">BRA 2:</span> {formatCurrency(report.bra2)}</p>
                <p><span className="font-medium">Basic Salary:</span> {formatCurrency(report.basicSala)}</p>
              </>
            )}
            <p><span className="font-medium">KPI Allowance:</span> {formatCurrency(report.kpiAllowance)}</p>
            <p><span className="font-medium">Incentives:</span> {formatCurrency(report.incentives)}</p>
            <p><span className="font-medium">Bonus:</span> {formatCurrency(report.bonus)}</p>
            <p><span className="font-medium">Attendance Allowance:</span> {formatCurrency(report.attendanceAllowance || 0)}</p>
            <p><span className="font-medium">Transport Allowance:</span> {formatCurrency(report.transportAllowance || 0)}</p>
            <p><span className="font-medium">Food Allowance:</span> {formatCurrency(report.foodAllowance || 0)}</p>
            <p><span className="font-medium">Medical Allowance:</span> {formatCurrency(report.medicalAllowance || 0)}</p>
            <p><span className="font-medium">Internet Allowance:</span> {formatCurrency(report.internetAllowance || 0)}</p>
            {!report.isDaySalaryBased && (
              <>
                <p><span className="font-medium">Regular OT Payment:</span> {formatCurrency(report.ot1Payment)}</p>
                <p><span className="font-medium">Double OT Payment:</span> {formatCurrency(report.ot2Payment)}</p>
                <p><span className="font-medium">Total OT Payment:</span> {formatCurrency(report.totalOtPayment)}</p>
              </>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Deductions & Contributions</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Salary Advances:</span> {formatCurrency(report.salaryAdvances)}</p>
            <p><span className="font-medium">Loans:</span> {formatCurrency(report.loans)}</p>
            <p><span className="font-medium">Other Deductions:</span> {formatCurrency(report.otherDeductions)}</p>
            <p><span className="font-medium">Total Deductions:</span> {formatCurrency(report.totalDeductions)}</p>
            {!report.isDaySalaryBased && (
              <>
                <p><span className="font-medium">No Pay:</span> {formatCurrency(report.noPay)}</p>
                <p><span className="font-medium">Employee EPF Contribution:</span> {formatCurrency(report.epf1)}</p>
                <p><span className="font-medium">Employer EPF Contribution:</span> {formatCurrency(report.epf2)}</p>
                <p><span className="font-medium">Employer ETF Contribution:</span> {formatCurrency(report.etf)}</p>
                <p><span className="font-medium">Employer Contribution:</span> {formatCurrency(report.employeeContribution)}</p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Attendance Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Working Days:</span> {report.workingDays}</p>
          </div>
          {!report.isDaySalaryBased && (
            <>
              <div>
                <p><span className="font-medium">Leave Days:</span> {report.leaveDays}</p>
              </div>
              <div>
                <p><span className="font-medium">Half Days:</span> {report.halfDays}</p>
              </div>
              <div>
                <p><span className="font-medium">No Pay Days:</span> {report.noPayDays}</p>
              </div>
              <div>
                <p><span className="font-medium">Regular OT Hours:</span> {report.ot1Hours}</p>
              </div>
              <div>
                <p><span className="font-medium">Double OT Hours:</span> {report.ot2Hours}</p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-8 pt-4 border-t text-xs text-gray-500 text-center">
        <p>This is an auto-generated salary report. For any discrepancies, please contact the HR department.</p>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );

  // Compact Print Template - Single Page Format
  const PrintTemplate = ({ report }) => (
    <div ref={printRef} className="p-6 bg-white" style={{ 
      width: '794px', 
      minHeight: '1123px', 
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.2'
    }}>
      {/* Header - More Compact */}
      <div className="text-center mb-4 border-b border-gray-300 pb-2">
        <h1 className="text-lg font-bold text-gray-800 mb-1">Car Service Private Limited</h1>
        <h2 className="text-lg text-gray-800 mb-1">Opanayake - Sri Lanka</h2>
        <p className="text-sm text-gray-600 mt-1">PAY SLIP FOR {formatMonth(report.month)} {report.year}</p>
      </div>

      {/* Employee Information - Compact */}
      <div className="flex justify-between mb-4">
        <div>
          <span className="font-medium">Employee Name: </span>
          <span>{report.employeeName}</span>
        </div>
        <div>
          <span className="font-medium">Employee No: </span>
          <span>{report.employeeNumber}</span>
        </div>
      </div>

      {/* Main Data Table - Compact Layout */}
      <table className="w-full border-collapse border border-gray-400 mb-4 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 p-1 text-left font-bold w-3/5">Description</th>
            <th className="border border-gray-400 p-1 text-right font-bold w-2/5">Amount (LKR)</th>
          </tr>
        </thead>
        <tbody>
          {/* Conditional rendering for Monthly Salary vs Daily Wage */}
          {report.isDaySalaryBased ? (
            // Daily Wage Structure
            <>
              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">EARNINGS</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Wages</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.wages)}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total Earning</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.wages)}</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">ALLOWANCES</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">KPI Bonus</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.kpiAllowance)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Incentives</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.incentives)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Bonus</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.bonus)}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total Allowances</td>
                <td className="border border-gray-400 p-1 text-right">
                  {formatCurrency(report.kpiAllowance + report.incentives + report.bonus)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Gross Salary</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.grossSalary)}</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">DEDUCTIONS</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Salary Advances</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.salaryAdvances)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Loan</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.loans)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Other</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.otherDeductions)}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total Deductions</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.totalDeductions)}</td>
              </tr>
              <tr className="font-bold bg-blue-50">
                <td className="border border-gray-400 p-1">NET SALARY</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.netSalary)}</td>
              </tr>
            </>
          ) : (
            // Monthly Salary Structure
            <>
              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">EARNINGS</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Basic Salary</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.basicSala)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">No Pay Amount</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.noPay)}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total Earning</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.epfLiableSalary)}</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">MONTHLY ALLOWANCES</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">KPI Bonus</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.kpiAllowance)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Incentives</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.incentives)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">OT Payment</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.totalOtPayment)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Bonus</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.bonus)}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total Allowances</td>
                <td className="border border-gray-400 p-1 text-right">
                  {formatCurrency(report.kpiAllowance + report.incentives + report.totalOtPayment + report.bonus)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Gross Salary</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.grossSalary)}</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">DEDUCTIONS</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Salary Advances</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.salaryAdvances)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Loan</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.loans)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Other</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.otherDeductions)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Employee EPF Contribution 8%</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.epf1)}</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-400 p-1">Total Deductions</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.totalDeductions)}</td>
              </tr>
              <tr className="font-bold bg-blue-50">
                <td className="border border-gray-400 p-1">NET SALARY</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.netSalary)}</td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border border-gray-400 p-1 font-bold" colSpan="2">EMPLOYER CONTRIBUTION</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Employer EPF Contribution12%</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.epf2)}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-1 pl-3">Employer ETF Contribution 3%</td>
                <td className="border border-gray-400 p-1 text-right">{formatCurrency(report.etf)}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* Footer - More Compact */}
      <div className="mt-6 pt-3 border-t border-gray-300 text-xs">
        <div className="flex justify-between items-start">
          <div className="w-2/3 pr-4">
            <p className="font-medium mb-2 leading-tight">
              "I hereby acknowledge the net receipt of my salary after deductions statutory and agreed deductions as per the appointment letter and subsequently issued increment letters which are applicable to calculate the Salary."
            </p>
          </div>
          <div className="w-1/3 text-center">
            <div className="border-t border-gray-400 pt-6 mt-1">
              <p className="text-gray-600">________________</p>
              <p className="text-xs mt-1">Employee Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Salary Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage employee salary reports.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by employee ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{formatMonth(month)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">Loading salary reports...</p>
          </div>
        ) : (
          <>
            {/* Table for medium+ screens */}
            <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated On</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{report.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            <div className="text-sm font-medium text-gray-800">{report.employeeName}</div>
                            <div className="text-xs text-gray-500 mt-1">Employee ID: {report.employeeNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatMonth(report.month)} {report.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {formatCurrency(report.netSalary)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.generatedOn).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <div className="inline-flex items-center gap-1">
                              <button
                                aria-label={`view-${report.id}`}
                                onClick={() => viewReportDetails(report)}
                                className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              <button
                                aria-label={`download-${report.id}`}
                                onClick={() => downloadReport(report)}
                                className="p-2 rounded-md text-green-600 hover:bg-green-50 transition"
                                title="Download PDF"
                              >
                                <FaDownload />
                              </button>
                              <button
                                aria-label={`print-${report.id}`}
                                onClick={() => printReport(report)}
                                className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition"
                                title="Print"
                              >
                                <FaPrint />
                              </button>
                              <button
                                aria-label={`delete-${report.id}`}
                                onClick={() => deleteReport(report.id, report.employeeName)}
                                className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                                title="Delete Report"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                          {loading ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                              <p>Loading salary reports...</p>
                            </div>
                          ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-lg font-medium text-gray-700">No salary reports generated yet</p>
                              <p className="text-sm text-gray-500">Generate your first salary report to see it here</p>
                              <a 
                                href="/generatesalary" 
                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                              >
                                Generate Salary Report
                              </a>
                            </div>
                          ) : (
                            <p>No reports match your search criteria</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card list for small screens */}
            <div className="sm:hidden space-y-4">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white shadow-sm rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          <div className="text-sm font-medium text-gray-800">Employee Name: {report.employeeName}</div>
                          <div className="text-xs text-gray-500 mt-1">Employee ID: {report.employeeNumber}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Report ID: {report.id}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          aria-label={`view-${report.id}`}
                          onClick={() => viewReportDetails(report)}
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          aria-label={`download-${report.id}`}
                          onClick={() => downloadReport(report)}
                          className="p-2 rounded-md text-green-600 hover:bg-green-50 transition"
                          title="Download PDF"
                        >
                          <FaDownload />
                        </button>
                        <button
                          aria-label={`print-${report.id}`}
                          onClick={() => printReport(report)}
                          className="p-2 rounded-md text-gray-600 hover:bg-gray-50 transition"
                          title="Print"
                        >
                          <FaPrint />
                        </button>
                        <button
                          aria-label={`delete-${report.id}`}
                          onClick={() => deleteReport(report.id, report.employeeName)}
                          className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                          title="Delete Report"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Period:</span> {formatMonth(report.month)} {report.year}
                      </div>
                      <div>
                        <span className="font-medium">Gross:</span> {formatCurrency(report.grossSalary)}
                      </div>
                      <div>
                        <span className="font-medium">Net:</span> <span className="text-green-600">{formatCurrency(report.netSalary)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Generated:</span> {new Date(report.generatedOn).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <p className="text-sm text-gray-500">Loading salary reports...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium text-gray-700">No salary reports generated yet</p>
                      <p className="text-sm text-gray-500">Generate your first salary report to see it here</p>
                      <a 
                        href="/generatesalary" 
                        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                      >
                        Generate Salary Report
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No reports match your search criteria</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Salary Report Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Employee Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Report ID:</span> {selectedReport.id}</p>
                  <p><span className="font-medium">Employee Number:</span> {selectedReport.employeeNumber}</p>
                  <p><span className="font-medium">Employee Name:</span> {selectedReport.employeeName}</p>
                  <p><span className="font-medium">Employee Category:</span> {selectedReport.categaryName}</p>
                  <p><span className="font-medium">Employee Department:</span> {selectedReport.departmentName}</p>
                  <p><span className="font-medium">Job Role:</span> {selectedReport.jobRoleName || 'N/A'}</p>
                  <p><span className="font-medium">Period:</span> {formatMonth(selectedReport.month)} {selectedReport.year}</p>
                  <p><span className="font-medium">Date Range:</span> {new Date(selectedReport.fromDate).toLocaleDateString()} to {new Date(selectedReport.toDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Generated On:</span> {new Date(selectedReport.generatedOn).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Salary Summary</h3>
                <div className="space-y-2">
                  {!selectedReport.isDaySalaryBased && (
                    <>
                      <p><span className="font-medium">EPF Liable Salary:</span> {formatCurrency(selectedReport.epfLiableSalary)}</p>
                    </>
                  )}
                  <p><span className="font-medium">Gross Salary:</span> {formatCurrency(selectedReport.grossSalary)}</p>
                  <p><span className="font-medium">Net Salary:</span> <span className="font-semibold text-green-600">{formatCurrency(selectedReport.netSalary)}</span></p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Earnings</h3>
                <div className="space-y-2">
                  {selectedReport.isDaySalaryBased && (
                    <>
                      <p><span className="font-medium">Day Salary:</span> {formatCurrency(selectedReport.daySalary)}</p>
                      <p><span className="font-medium">KPI Rate:</span> {formatCurrency(selectedReport.kpiRate)}</p>
                      <p><span className="font-medium">Wages:</span> {formatCurrency(selectedReport.wages)}</p>
                    </>
                  )}
                  
                  {!selectedReport.isDaySalaryBased && (
                    <>
                      <p><span className="font-medium">Basic Statutory Salary:</span> {formatCurrency(selectedReport.basicStationarySal)}</p>
                      <p><span className="font-medium">BRA 1:</span> {formatCurrency(selectedReport.bra1)}</p>
                      <p><span className="font-medium">BRA 2:</span> {formatCurrency(selectedReport.bra2)}</p>
                      <p><span className="font-medium">Basic Salary:</span> {formatCurrency(selectedReport.basicSala)}</p>
                    </>
                  )}
                  <p><span className="font-medium">KPI Allowance:</span> {formatCurrency(selectedReport.kpiAllowance)}</p>
                  <p><span className="font-medium">Incentives:</span> {formatCurrency(selectedReport.incentives)}</p>
                  <p><span className="font-medium">Bonus:</span> {formatCurrency(selectedReport.bonus)}</p>
                  <p><span className="font-medium">Attendance Allowance:</span> {formatCurrency(selectedReport.attendanceAllowance || 0)}</p>
                  <p><span className="font-medium">Transport Allowance:</span> {formatCurrency(selectedReport.transportAllowance || 0)}</p>
                  <p><span className="font-medium">Food Allowance:</span> {formatCurrency(selectedReport.foodAllowance || 0)}</p>
                  <p><span className="font-medium">Medical Allowance:</span> {formatCurrency(selectedReport.medicalAllowance || 0)}</p>
                  <p><span className="font-medium">Internet Allowance:</span> {formatCurrency(selectedReport.internetAllowance || 0)}</p>
                  {!selectedReport.isDaySalaryBased && (
                    <>
                      <p><span className="font-medium">Regular OT Payment:</span> {formatCurrency(selectedReport.ot1Payment)}</p>
                      <p><span className="font-medium">Double OT Payment:</span> {formatCurrency(selectedReport.ot2Payment)}</p>
                      <p><span className="font-medium">Total OT Payment:</span> {formatCurrency(selectedReport.totalOtPayment)}</p>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Deductions & Contributions</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Salary Advances:</span> {formatCurrency(selectedReport.salaryAdvances)}</p>
                  <p><span className="font-medium">Loans:</span> {formatCurrency(selectedReport.loans)}</p>
                  <p><span className="font-medium">Other Deductions:</span> {formatCurrency(selectedReport.otherDeductions)}</p>
                  <p><span className="font-medium">Total Deductions:</span> {formatCurrency(selectedReport.totalDeductions)}</p>
                  {!selectedReport.isDaySalaryBased && (
                    <>
                      <p><span className="font-medium">No Pay:</span> {formatCurrency(selectedReport.noPay)}</p>
                      <p><span className="font-medium">Employee EPF Contribution:</span> {formatCurrency(selectedReport.epf1)}</p>
                      <p><span className="font-medium">Employer EPF Contribution:</span> {formatCurrency(selectedReport.epf2)}</p>
                      <p><span className="font-medium">Employer ETF Contribution:</span> {formatCurrency(selectedReport.etf)}</p>
                      <p><span className="font-medium">Employer Contribution:</span> {formatCurrency(selectedReport.employeeContribution)}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Attendance Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p><span className="font-medium">Working Days:</span> {selectedReport.workingDays}</p>
                </div>

                {!selectedReport.isDaySalaryBased && (
                    <>
                      <div>
                  <p><span className="font-medium">Leave Days:</span> {selectedReport.leaveDays}</p>
                </div>
                <div>
                  <p><span className="font-medium">Half Days:</span> {selectedReport.halfDays}</p>
                </div>
                <div>
                  <p><span className="font-medium">No Pay Days:</span> {selectedReport.noPayDays}</p>
                </div>
                <div>
                  <p><span className="font-medium">Regular OT Hours:</span> {selectedReport.ot1Hours}</p>
                </div>
                <div>
                  <p><span className="font-medium">Double OT Hours:</span> {selectedReport.ot2Hours}</p>
                </div>
                    </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => downloadReport(selectedReport)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                <FaDownload /> Download PDF
              </button>
              <button
                onClick={() => printReport(selectedReport)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={() => deleteReport(selectedReport.id, selectedReport.employeeName)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                <FaTrash /> Delete Report
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg shadow-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden PDF Template (for generating PDF downloads) */}
      {selectedReport && (
        <div className="fixed -left-[9999px] top-0">
          <PDFTemplate report={selectedReport} />
        </div>
      )}

      {/* Hidden Print Template (for printing) */}
      {selectedReport && (
        <div className="fixed -left-[9999px] top-0">
          <PrintTemplate report={selectedReport} />
        </div>
      )}
    </div>
  );
}
