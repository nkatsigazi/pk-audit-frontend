import { useState } from 'react';
import axios from 'axios';

// Change: Import the main object directly
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Attach fonts to pdfMake
(pdfMake as any).vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// 1. Define the structure of your Invoice
interface Invoice {
  amount: number;
  totalHours: number;
  clientName?: string;
  date?: string;
}

export default function Billing() {
  const [engagementId, setEngagementId] = useState('');
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAndGenerate = async () => {
    if (!engagementId) return;
    setLoading(true);
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/billing/${engagementId}/invoice`);
      const data: Invoice = res.data;
      
      setInvoiceData(data);

      const docDefinition = {
        content: [
          { text: 'INVOICE', style: 'header' },
          { text: `Engagement ID: ${engagementId}`, margin: [0, 10] },
          { text: `Client: ${data.clientName || 'N/A'}`, margin: [0, 5] },
          { 
            table: {
              widths: ['*', 'auto'],
              body: [
                ['Description', 'Value'],
                ['Total Hours Worked', data.totalHours.toString()],
                ['Total Amount Due', `$${data.amount.toLocaleString()}`]
              ]
            }
          }
        ],
        styles: {
          header: { fontSize: 22, bold: true, color: '#0d6efd' }
        },
      };

      // Use the local object we configured
      (pdfMake as any).createPdf(docDefinition as any).download(`invoice_${engagementId}.pdf`);

    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Could not find invoice for this ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h3>Billing & Invoicing</h3>
        <p className="text-muted">Enter an Engagement ID to generate a professional PDF invoice.</p>
        
        <div className="input-group mb-3">
          <input 
            type="text" 
            placeholder="e.g. ENG-101" 
            value={engagementId} 
            onChange={e => setEngagementId(e.target.value)} 
            className="form-control" 
          />
          <button 
            className="btn btn-primary" 
            onClick={fetchAndGenerate}
            disabled={loading || !engagementId}
          >
            {loading ? 'Processing...' : 'Generate Invoice PDF'}
          </button>
        </div>

        {invoiceData && (
          <div className="mt-4 p-3 bg-light border rounded">
            <h5>Preview for {engagementId}</h5>
            <hr />
            <div className="row">
              <div className="col-6">
                <strong>Hours:</strong> {invoiceData.totalHours}
              </div>
              <div className="col-6 text-end">
                <strong>Total Amount:</strong> ${invoiceData.amount}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}