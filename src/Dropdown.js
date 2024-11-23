import React from 'react';
import Select from 'react-select';

const Dropdown = ({ options, onChange, value, placeholder, isMulti = false }) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      isMulti={isMulti}
    />
  );
};

export default Dropdown;
