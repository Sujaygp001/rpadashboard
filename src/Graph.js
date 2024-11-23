import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Graph = ({ graphType, data }) => {
  if (!data) {
    return null;
  }

  // Configuration for the bar chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date Range',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Orders',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ marginTop: '30px' }}>
      {graphType?.value === 'bar' && <Bar options={options} data={data} />}
    </div>
  );
};

export default Graph;
