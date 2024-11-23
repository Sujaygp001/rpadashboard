// src/ReportSummaryPage.js
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ReportSummaryPage = ({ selectedEHR }) => {
  // State for managing dropdown visibility for export options
  const [exportDropdownVisible, setExportDropdownVisible] = useState({
    failed: false,
    successful: false,
  });

  // Refs for export buttons
  const failedButtonRef = useRef(null);
  const successfulButtonRef = useRef(null);

  // Refs for dropdowns
  const failedDropdownRef = useRef(null);
  const successfulDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        failedDropdownRef.current &&
        !failedDropdownRef.current.contains(event.target) &&
        failedButtonRef.current &&
        !failedButtonRef.current.contains(event.target)
      ) {
        setExportDropdownVisible((prev) => ({ ...prev, failed: false }));
      }

      if (
        successfulDropdownRef.current &&
        !successfulDropdownRef.current.contains(event.target) &&
        successfulButtonRef.current &&
        !successfulButtonRef.current.contains(event.target)
      ) {
        setExportDropdownVisible((prev) => ({ ...prev, successful: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportClick = (type) => {
    setExportDropdownVisible((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleExport = (type, format) => {
    const dataToExport = type === 'failed' ? failedDocumentUploads : successfulDocumentUploads;
    if (format === 'csv' || format === 'txt') {
      const csvContent = convertToCSV(dataToExport);
      downloadFile(csvContent, `${type}_document_uploads.${format}`, format);
    } else if (format === 'xlsx') {
      exportToExcel(dataToExport, `${type}_document_uploads.xlsx`);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      downloadFile(jsonContent, `${type}_document_uploads.json`, 'json');
    }
    setExportDropdownVisible((prev) => ({
      ...prev,
      [type]: false,
    }));
  };

  const convertToCSV = (data) => {
    const header = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(','));
    return [header, ...rows].join('\n');
  };

  const downloadFile = (content, filename, format) => {
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  };

  // Dummy data for failed document uploads
  const failedDocumentUploads = [
    {
      ehr: 'Athena',
      account: 'Account A',
      date: '2024-11-22',
      orderNumber: '12345',
      documentId: '98765',
      remarks: 'Patient record not found',
      wavStatus: 'Failed',
      pdfLink: 'Order12345.pdf',
    },
    {
      ehr: 'HCHB',
      account: 'Account B',
      date: '2024-11-23',
      orderNumber: '67890',
      documentId: '54321',
      remarks: 'Invalid document format',
      wavStatus: 'Failed',
      pdfLink: 'Order67890.pdf',
    },
  ];

  // Dummy data for successful document uploads
  const successfulDocumentUploads = [
    {
      ehr: 'Kinnser',
      account: 'Account C',
      date: '2024-11-22',
      orderNumber: '11223',
      documentId: '66789',
      remarks: 'Upload successful',
      wavStatus: 'Successful',
    },
    {
      ehr: 'Axxess',
      account: 'Account D',
      date: '2024-11-23',
      orderNumber: '44556',
      documentId: '77890',
      remarks: 'Uploaded on first attempt',
      wavStatus: 'Successful',
    },
  ];

  // Function to handle bulk download of PDFs for the selected EHR
  const handleBulkDownloadPDFs = () => {
    const zip = new JSZip();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const folderName = `${selectedEHR}-${today}`;

    // Filter documents by the selected EHR
    const filteredFailedUploads = failedDocumentUploads.filter(
      (doc) => doc.ehr === selectedEHR
    );

    const filteredSuccessfulUploads = successfulDocumentUploads.filter(
      (doc) => doc.ehr === selectedEHR
    );

    // Add filtered failed uploads to the zip
    filteredFailedUploads.forEach((document) => {
      zip.folder(folderName).file(
        `${document.pdfLink}`,
        'PDF content for demonstration'
      );
    });

    // Add filtered successful uploads to the zip
    filteredSuccessfulUploads.forEach((document) => {
      zip.folder(folderName).file(
        `${document.pdfLink}`,
        'PDF content for demonstration'
      );
    });

    if (filteredFailedUploads.length === 0 && filteredSuccessfulUploads.length === 0) {
      alert("No documents available for the selected EHR.");
      return;
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `${folderName}.zip`);
    });
  };

  return (
    <div
      style={{
        padding: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f5f5f7',
        color: '#1d1d1f',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Report Summary Page</h1>

      {/* Failed Document Upload Table */}
      <h2 style={{ marginBottom: '10px' }}>Failed Document Uploads</h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '10px',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={tableHeaderStyle}>EHR</th>
            <th style={tableHeaderStyle}>Account</th>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Order Number</th>
            <th style={tableHeaderStyle}>Document ID</th>
            <th style={tableHeaderStyle}>Remarks</th>
            <th style={tableHeaderStyle}>WAV Document Upload Status</th>
            <th style={tableHeaderStyle}>Document/Order PDF Link</th>
          </tr>
        </thead>
        <tbody>
          {failedDocumentUploads.map((row, index) => (
            <tr key={index}>
              <td style={tableCellStyle}>{row.ehr}</td>
              <td style={tableCellStyle}>{row.account}</td>
              <td style={tableCellStyle}>{row.date}</td>
              <td style={tableCellStyle}>{row.orderNumber}</td>
              <td style={tableCellStyle}>{row.documentId}</td>
              <td style={tableCellStyle}>{row.remarks}</td>
              <td style={tableCellStyle}>{row.wavStatus}</td>
              <td style={tableCellStyle}>
                <a href={`#${row.pdfLink}`} style={{ color: '#0071E3' }}>
                  {row.pdfLink}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        {/* Export Failed Document Table Button */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            ref={failedButtonRef}
            onClick={() => handleExportClick('failed')}
            style={exportButtonStyle}
          >
            Export Failed Table
          </button>
          {exportDropdownVisible.failed && (
            <div ref={failedDropdownRef} style={translucentDropdownStyle}>
              {['csv', 'txt', 'xlsx', 'json'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport('failed', format)}
                  style={translucentDropdownItemStyle}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Download PDF Button */}
        <button
          onClick={handleBulkDownloadPDFs}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0071E3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Bulk Download
        </button>
      </div>

      {/* Successful Document Upload Table */}
      <h2 style={{ marginBottom: '10px' }}>Successful Document Uploads</h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '10px',
          backgroundColor: '#fff',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={tableHeaderStyle}>EHR</th>
            <th style={tableHeaderStyle}>Account</th>
            <th style={tableHeaderStyle}>Date</th>
            <th style={tableHeaderStyle}>Order Number</th>
            <th style={tableHeaderStyle}>Document ID</th>
            <th style={tableHeaderStyle}>Remarks</th>
            <th style={tableHeaderStyle}>WAV Document Upload Status</th>
          </tr>
        </thead>
        <tbody>
          {successfulDocumentUploads.map((row, index) => (
            <tr key={index}>
              <td style={tableCellStyle}>{row.ehr}</td>
              <td style={tableCellStyle}>{row.account}</td>
              <td style={tableCellStyle}>{row.date}</td>
              <td style={tableCellStyle}>{row.orderNumber}</td>
              <td style={tableCellStyle}>{row.documentId}</td>
              <td style={tableCellStyle}>{row.remarks}</td>
              <td style={tableCellStyle}>{row.wavStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Export Successful Document Table Button */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '30px' }}>
        <button
          ref={successfulButtonRef}
          onClick={() => handleExportClick('successful')}
          style={exportButtonStyle}
        >
          Export Successful Table
        </button>
        {exportDropdownVisible.successful && (
          <div ref={successfulDropdownRef} style={translucentDropdownStyle}>
            {['csv', 'txt', 'xlsx', 'json'].map((format) => (
              <button
                key={format}
                onClick={() => handleExport('successful', format)}
                style={translucentDropdownItemStyle}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles for the table header and cells
const tableHeaderStyle = {
  padding: '10px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
  backgroundColor: '#e6e6e6',
  fontWeight: 'bold',
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

// Styles for export button and translucent dropdown
const exportButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#0071E3',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'background-color 0.3s ease',
};

const translucentDropdownStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(249, 249, 249, 0.8)', // Translucent background
  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
  position: 'absolute',
  top: '100%',
  left: '0',
  borderRadius: '12px',
  overflow: 'hidden',
  transform: 'translateY(10px)',
  zIndex: '100',
  marginTop: '8px',
  width: '150px',
};

const translucentDropdownItemStyle = {
  padding: '8px 16px',
  borderBottom: '1px solid #ddd',
  cursor: 'pointer',
  backgroundColor: 'rgba(249, 249, 249, 0.8)', // Match dropdown background
  color: '#0071E3',
  textAlign: 'left',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  fontSize: '14px',
  fontWeight: '500',
};

export default ReportSummaryPage;
