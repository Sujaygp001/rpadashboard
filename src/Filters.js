import React from 'react';
import Dropdown from './Dropdown';

const Filters = ({
  graphTypeOptions,
  ehrOptions,
  agencyOptions,
  botTypeOptions,
  dateOptions,
  graphType,
  setGraphType,
  ehr,
  setEhr,
  agency,
  setAgency,
  botType,
  setBotType,
  dateRange,
  setDateRange,
  customRange,
  setCustomRange,
  loading,
  fetchAgencyOptions,
}) => {
  const handleEHRChange = (selectedOption) => {
    setEhr(selectedOption);
    if (selectedOption) {
      fetchAgencyOptions(selectedOption.value);
    } else {
      setAgency([]);
    }
  };

  const handleAgencyChange = (selectedOptions) => {
    if (selectedOptions.some((option) => option.value === 'select-all')) {
      // If "Select All" is selected, select all available options
      setAgency(agencyOptions);
    } else {
      setAgency(selectedOptions);
    }
  };

  const handleCustomRange = (e) => {
    const { name, value } = e.target;
    setCustomRange({ ...customRange, [name]: value });
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Dropdown
        options={graphTypeOptions}
        onChange={setGraphType}
        value={graphType}
        placeholder="Select Graph Type"
      />
      <Dropdown
        options={ehrOptions}
        onChange={handleEHRChange}
        value={ehr}
        placeholder="Select EHR"
      />
      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#0071E3' }}>Loading Agency/PG...</p>
      ) : (
        <Dropdown
          options={agencyOptions}
          onChange={handleAgencyChange}
          value={agency}
          placeholder="Select Agency/PG"
          isMulti
        />
      )}
      <Dropdown
        options={botTypeOptions}
        onChange={setBotType}
        value={botType}
        placeholder="Select Bot Type"
      />
      <Dropdown
        options={dateOptions}
        onChange={setDateRange}
        value={dateRange}
        placeholder="Select Date Range"
      />
      {dateRange?.value === 'custom' && (
        <div>
          <input
            type="date"
            name="start"
            value={customRange.start}
            onChange={handleCustomRange}
            placeholder="Start Date"
            style={{
              padding: '10px',
              border: '1px solid #d1d1d6',
              borderRadius: '8px',
              marginBottom: '10px',
              width: '100%',
            }}
          />
          <input
            type="date"
            name="end"
            value={customRange.end}
            onChange={handleCustomRange}
            placeholder="End Date"
            style={{
              padding: '10px',
              border: '1px solid #d1d1d6',
              borderRadius: '8px',
              width: '100%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Filters;
