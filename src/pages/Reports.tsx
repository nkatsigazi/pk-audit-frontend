import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports() {
  const [reportType, setReportType] = useState<'engagement' | 'client' | 'firm'>('engagement');
  const [preview, setPreview] = useState<string | null>(null);

  const generateReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Price & King Audit Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Summary`, 14, 32);
    doc.text('Generated on ' + new Date().toLocaleDateString(), 14, 40);

    if (reportType === 'engagement') {
      autoTable(doc, {
        startY: 50,
        head: [['Engagement', 'Client', 'Year', 'Status', 'Progress']],
        body: [
          ['2025 Statutory Audit', 'Uganda Revenue Authority', '2025', 'In Progress', '65%'],
          ['2025 NGO Audit', 'Save the Children Uganda', '2025', 'Planning', '30%'],
        ],
      });
    } else if (reportType === 'client') {
      autoTable(doc, {
        startY: 50,
        head: [['Client', 'Engagements', 'Total Value', 'Last Audit']],
        body: [
          ['Uganda Revenue Authority', '3', 'UGX 450M', '2024'],
          ['Save the Children Uganda', '2', 'UGX 280M', '2025'],
        ],
      });
    } else {
      autoTable(doc, {
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Clients', '68'],
          ['Active Engagements', '21'],
          ['Completed This Year', '12'],
          ['Review Notes Open', '8'],
        ],
      });
    }

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPreview(pdfUrl);
  };

  const downloadReport = () => {
    if (!preview) return;
    const a = document.createElement('a');
    a.href = preview;
    a.download = `price-king-${reportType}-report.pdf`;
    a.click();
  };

  return (
    <div>
      <h3 className="mb-4">Reports</h3>
      <p>Select a report type, generate preview, then download.</p>

      <div className="card p-4 mb-4">
        <div className="mb-3">
          <label className="form-label">Report Type</label>
          <select className="form-select" value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
            <option value="engagement">Engagement Summary</option>
            <option value="client">Client Portfolio</option>
            <option value="firm">Firm Overview</option>
          </select>
        </div>

        <button className="btn btn-primary me-2" onClick={generateReport}>
          Generate Preview
        </button>
        {preview && (
          <button className="btn btn-success" onClick={downloadReport}>
            Download PDF
          </button>
        )}
      </div>

      {preview && (
        <div className="card">
          <div className="card-header">Preview</div>
          <div className="card-body p-0">
            <iframe src={preview} width="100%" height="800px" style={{ border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}