// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Filters from './Filters';
import Graph from './Graph';
import ReportSummaryPage from './ReportSummaryPage'; // Import the new ReportSummaryPage component
import { Chart as ChartJS, ArcElement, BarElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from 'chart.js';

// Register required Chart.js components
ChartJS.register(ArcElement, BarElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

const Dashboard = () => {
  const [graphType, setGraphType] = useState(null);
  const [ehr, setEhr] = useState(null);
  const [agency, setAgency] = useState([]);
  const [botType, setBotType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [agencyOptions, setAgencyOptions] = useState([{ value: 'select-all', label: 'Select All' }]);
  const [loading, setLoading] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [istTime, setIstTime] = useState(new Date());
  const [utcTime, setUtcTime] = useState(new Date());
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedEhrInfo, setSelectedEhrInfo] = useState(null);

  const sidePanelRef = useRef(null);
  const navigate = useNavigate();

  const graphTypeOptions = [
    { value: 'bar', label: 'Bar Graph' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'line', label: 'Line Graph' },
  ];

  const ehrOptions = [
    { value: 'Athena', label: 'Athena' },
    { value: 'HCHB', label: 'HCHB' },
    { value: 'Kinnser', label: 'Kinnser' },
    { value: 'Kantime', label: 'Kantime' },
    { value: 'Axxess', label: 'Axxess' },
  ];

  const botTypeOptions = [
    { value: 'signed', label: 'Signed' },
    { value: 'unsigned', label: 'Unsigned' },
    { value: 'patient', label: 'Patient' },
    { value: 'reverse_sync', label: 'Reverse Sync' },
  ];

  const getDateRanges = () => {
    const currentDate = new Date();
    const oneDay = new Date(currentDate);
    const oneWeek = new Date(currentDate);
    const oneMonth = new Date(currentDate);

    oneWeek.setDate(currentDate.getDate() - 7);
    oneMonth.setMonth(currentDate.getMonth() - 1);

    return {
      daily: { start: oneDay.toISOString().split('T')[0], end: oneDay.toISOString().split('T')[0] },
      weekly: { start: oneWeek.toISOString().split('T')[0], end: currentDate.toISOString().split('T')[0] },
      monthly: { start: oneMonth.toISOString().split('T')[0], end: currentDate.toISOString().split('T')[0] },
    };
  };

  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    const ranges = getDateRanges();
    setDateOptions([
      { value: 'daily', label: `Daily (${ranges.daily.start})` },
      { value: 'weekly', label: `Weekly (${ranges.weekly.start} - ${ranges.weekly.end})` },
      { value: 'monthly', label: `Monthly (${ranges.monthly.start} - ${ranges.monthly.end})` },
      { value: 'custom', label: 'Custom Range' },
    ]);

    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(new Date(now.getTime() + 5.5 * 60 * 60 * 1000)); // IST offset
      setIstTime(new Date(now.getTime()));
    }, 1000);

    // Add event listener to handle clicking outside of the side panel
    const handleClickOutside = (event) => {
      if (sidePanelRef.current && !sidePanelRef.current.contains(event.target)) {
        setSidePanelOpen(false);
        setSelectedEhrInfo(null); // Close EHR info box when side panel is closed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAgencyOptions = async (ehrName) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://da-web-app.azurewebsites.net/api/Config/GetConfigDataByName/${ehrName}`,
        {
          headers: {
            'X-SERVICE-KEY': '9A823946C424797374D357C436CEC',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch agency options');
      const data = await response.json();

      const credentials = data.credentials.map((credential) => ({
        value: credential.credentialName,
        label: credential.credentialName,
      }));
      setAgencyOptions([{ value: 'select-all', label: 'Select All' }, ...credentials]);
    } catch (error) {
      console.error('Error fetching agency options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGraphs = () => {
    if (!ehr || !agency.length || !botType || !dateRange) {
      alert('Please select all filters.');
      return;
    }

    // Set up static graph data for daily, weekly, and monthly ranges
    let updatedGraphData = null;

    if (dateRange.value === 'daily') {
      updatedGraphData = {
        labels: ['Today'],
        datasets: [
          {
            label: 'Total Orders Needed to Be Uploaded',
            data: [30],
            backgroundColor: '#FF9500',
            borderColor: '#FF9500',
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Orders Actually Uploaded',
            data: [25],
            backgroundColor: '#34C759',
            borderColor: '#34C759',
            fill: false,
            tension: 0.1,
          },
        ],
      };
    } else if (dateRange.value === 'weekly') {
      updatedGraphData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
          {
            label: 'Total Orders Needed to Be Uploaded',
            data: [50, 60, 55, 70, 65, 80, 75],
            backgroundColor: '#FF9500',
            borderColor: '#FF9500',
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Orders Actually Uploaded',
            data: [40, 50, 45, 65, 60, 70, 68],
            backgroundColor: '#34C759',
            borderColor: '#34C759',
            fill: false,
            tension: 0.1,
          },
        ],
      };
    } else if (dateRange.value === 'monthly') {
      updatedGraphData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Total Orders Needed to Be Uploaded',
            data: [200, 210, 190, 220],
            backgroundColor: '#FF9500',
            borderColor: '#FF9500',
            fill: false,
            tension: 0.1,
          },
          {
            label: 'Orders Actually Uploaded',
            data: [180, 190, 170, 200],
            backgroundColor: '#34C759',
            borderColor: '#34C759',
            fill: false,
            tension: 0.1,
          },
        ],
      };
    }

    setGraphData(updatedGraphData);
    setShowGraphs(true);
  };

  const handleEhrClick = (ehrOption) => {
    if (ehr && ehr.value === ehrOption.value && selectedEhrInfo) {
      // If the same EHR button is clicked again, toggle off the info box
      setSelectedEhrInfo(null);
      setEhr(null);
    } else {
      // Otherwise, set the EHR and show the info box
      setEhr(ehrOption);
      setSelectedEhrInfo({
        startTime: '10:00 AM',
        endTime: '10:30 AM',
        totalTime: '30 mins',
      });
    }
  };

  const handleReportSummaryClick = () => {
    navigate('/report-summary');
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f5f5f7',
        color: '#1d1d1f',
        minHeight: '100vh',
      }}
    >
      {/* Hamburger Menu and Side Panel */}
      <div style={{ position: 'relative' }}>
        {!sidePanelOpen && (
          <button
            onClick={() => setSidePanelOpen(true)}
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              backgroundColor: '#0071E3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              cursor: 'pointer',
              zIndex: 1000, // Make sure the button stays on top
            }}
          >
            ☰
          </button>
        )}
        <div
          ref={sidePanelRef}
          style={{
            position: 'fixed',
            top: '0',
            left: sidePanelOpen ? '0' : '-250px',
            width: '250px',
            height: '100%',
            backgroundColor: '#0071E3',
            color: '#fff',
            transition: '0.3s',
            padding: '20px',
            zIndex: 999, // Ensure the side panel is below the button
          }}
        >
          <h2>EHR Triggers</h2>
          {ehrOptions.map((ehrOption) => (
            <div key={ehrOption.value}>
              <button
                onClick={() => handleEhrClick(ehrOption)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: '#fff',
                  color: '#0071E3',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {ehrOption.label}
              </button>
              {ehr && ehr.value === ehrOption.value && selectedEhrInfo && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    color: '#0071E3',
                    borderRadius: '4px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <h4>About {ehrOption.label}</h4>
                  <p>{ehrOption.label} is an electronic health record system used for managing patient records and workflow processes.</p>
                  <p><strong>Bot Start Time:</strong> {selectedEhrInfo.startTime}</p>
                  <p><strong>Bot End Time:</strong> {selectedEhrInfo.endTime}</p>
                  <p><strong>Total Execution Time:</strong> {selectedEhrInfo.totalTime}</p>
                </div>
              )}
            </div>
          ))}

          {/* Contact Us Button */}
          <a
            href="mailto:support@ehr.com"
            style={{
              display: 'block',
              marginTop: '20px',
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              color: '#0071E3',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            Contact Us
          </a>
        </div>
      </div>

      {/* Clocks */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', padding: '10px' }}>
        <div style={{ textAlign: 'right' }}>
          <h4>IST Time</h4>
          <p>{istTime.toLocaleTimeString('en-US', { hour12: true })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h4>UTC Time</h4>
          <p>{utcTime.toLocaleTimeString('en-US', { hour12: true })}</p>
        </div>
      </div>

      {/* Title */}
      <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem', fontWeight: '600', color: '#1d1d1f' }}>
        Bot Success Rate Dashboard
      </h1>

      {/* Filters */}
      <Filters
        graphTypeOptions={graphTypeOptions}
        ehrOptions={ehrOptions}
        agencyOptions={agencyOptions}
        botTypeOptions={botTypeOptions}
        dateOptions={dateOptions}
        graphType={graphType}
        setGraphType={setGraphType}
        ehr={ehr}
        setEhr={setEhr}
        agency={agency}
        setAgency={setAgency}
        botType={botType}
        setBotType={setBotType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        customRange={customRange}
        setCustomRange={setCustomRange}
        loading={loading}
        fetchAgencyOptions={fetchAgencyOptions}
      />

      {/* Load Graph Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleLoadGraphs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0071E3',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Graphs'}
        </button>
      </div>

      {/* Graph Display */}
      {showGraphs && (
        <>
          <Graph graphType={graphType} data={graphData} />
          {/* Report Summary Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleReportSummaryClick}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0071E3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Report Summary
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/report-summary" element={<ReportSummaryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
