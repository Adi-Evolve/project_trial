import React from 'react';

const toCSV = (arr: any[]) => {
  if (!arr || arr.length === 0) return '';
  const keys = Object.keys(arr[0]);
  const lines = [keys.join(',')];
  for (const item of arr) {
    lines.push(keys.map(k => JSON.stringify(item[k] ?? '')).join(','));
  }
  return lines.join('\n');
};

const ExportDataButton: React.FC<{ data: any }> = ({ data }) => {
  const handleExport = () => {
    const arr = Array.isArray(data) ? data : (data.projects || []);
    const csv = toCSV(arr);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="btn-secondary text-xs px-3 py-1 rounded ml-2">
      Export Data
    </button>
  );
};

export default ExportDataButton;
