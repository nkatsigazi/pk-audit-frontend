import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function TrialBalanceImport() {
  const { id } = useParams<{ id: string }>();
  const engagementId = id ? parseInt(id, 10) : null;

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [leadSchedules, setLeadSchedules] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  if (!engagementId) {
    return <p className="text-danger">Invalid engagement ID</p>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      setPreviewData(json);
      generateLeadSchedules(json);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const generateLeadSchedules = (data: any[]) => {
    const schedules: any = {
      assets: { total: 0, accounts: [] },
      liabilities: { total: 0, accounts: [] },
      equity: { total: 0, accounts: [] },
      revenue: { total: 0, accounts: [] },
      expenses: { total: 0, accounts: [] },
    };

    data.forEach((row: any) => {
      const balance = (parseFloat(row.Debit || 0) || 0) - (parseFloat(row.Credit || 0) || 0);
      const accountNo = String(row['Account No'] || row.accountNo || '').padStart(4, '0');

      let group = 'expenses';
      if (accountNo.startsWith('1')) group = 'assets';
      else if (accountNo.startsWith('2')) group = 'liabilities';
      else if (accountNo.startsWith('3')) group = 'equity';
      else if (accountNo.startsWith('4')) group = 'revenue';

      schedules[group].accounts.push({
        no: accountNo,
        name: row['Account Description'] || row.accountName || 'Unknown',
        balance,
      });
      schedules[group].total += balance;
    });

    // Calculate profit and materiality
    const profit = schedules.revenue.total + schedules.expenses.total; // expenses negative
    const totalAssets = schedules.assets.total;
    const materiality = Math.max(
      Math.abs(profit) * 0.05,
      totalAssets * 0.01,
      5000
    );

    setLeadSchedules(schedules);
    setAnalytics({
      profit: Math.round(profit),
      materiality: Math.round(materiality),
      currentRatio: schedules.liabilities.total !== 0 
        ? (schedules.assets.total / Math.abs(schedules.liabilities.total)).toFixed(2)
        : 'N/A',
      grossMargin: schedules.revenue.total !== 0
        ? ((schedules.revenue.total + schedules.expenses.total) / schedules.revenue.total * 100).toFixed(1)
        : 'N/A',
    });
  };

  const uploadToDB = async () => {
    if (!previewData.length) return;
    setUploading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/${engagementId}/trial-balance/upload`, {
        rows: previewData,
      });
      alert('Trial balance uploaded and saved to database!');
    } catch (err) {
      console.error(err);
      alert('Error saving to database');
    }
    setUploading(false);
  };

  return (
    <div>
      <Link to={`/engagements/${engagementId}`} className="btn btn-outline-secondary mb-4">
        ← Back to Engagement
      </Link>

      <h3>Trial Balance Import</h3>
      <p>Upload the client's trial balance to generate lead schedules and analytics.</p>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="form-control mb-4" />

      {file && previewData.length > 0 && (
        <>
          <div className="card mb-4">
            <div className="card-header">
              Preview: {file.name} ({previewData.length} rows)
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: '400px' }}>
                <table className="table table-sm mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row: any, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j) => (
                          <td key={j}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Analytics */}
          {analytics && (
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-primary shadow">
                  <div className="card-body text-center">
                    <h5>Estimated Materiality</h5>
                    <h2 className="text-primary">UGX {analytics.materiality.toLocaleString()}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-info shadow">
                  <div className="card-body text-center">
                    <h5>Current Ratio</h5>
                    <h2 className="text-info">{analytics.currentRatio}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-success shadow">
                  <div className="card-body text-center">
                    <h5>Profit / (Loss)</h5>
                    <h2 className={analytics.profit >= 0 ? 'text-success' : 'text-danger'}>
                      UGX {analytics.profit.toLocaleString()}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lead Schedules */}
          {leadSchedules && (
            <div>
              <h4>Lead Schedules</h4>
              {Object.entries(leadSchedules).map(([group, data]: [string, any]) => (
                <div key={group} className="card mb-3">
                  <div className="card-header">
                    <strong>{group.charAt(0).toUpperCase() + group.slice(1)}</strong> — Total: UGX {data.total.toLocaleString()}
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Account No</th>
                          <th>Description</th>
                          <th className="text-end">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.accounts.map((acc: any, i: number) => (
                          <tr key={i}>
                            <td>{acc.no}</td>
                            <td>{acc.name}</td>
                            <td className="text-end">{acc.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-success btn-lg mt-4"
            onClick={uploadToDB}
            disabled={uploading}
          >
            {uploading ? 'Saving...' : 'Save Trial Balance to Database'}
          </button>
        </>
      )}
    </div>
  );
}