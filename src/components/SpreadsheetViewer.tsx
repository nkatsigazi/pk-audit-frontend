import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface SheetData {
  name: string;
  data: any[][];
}

export default function SpreadsheetViewer({ fileUrl }: { fileUrl: string }) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpreadsheet = async () => {
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Parsing sheets with correct types
        const parsedSheets = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]; // Cast to `any[][]`
          return { name, data: json };
        });

        setSheets(parsedSheets);  // Now TypeScript knows the correct types
        setLoading(false);
      } catch (err) {
        console.error('Error loading spreadsheet:', err);
        setLoading(false);
      }
    };

    loadSpreadsheet();
  }, [fileUrl]);

  if (loading) return <p>Loading spreadsheet...</p>;
  if (sheets.length === 0) return <p>No data found in spreadsheet</p>;

  const currentSheet = sheets[activeSheet];

  return (
    <div className="border rounded shadow-sm">
      {/* Sheet Tabs */}
      <ul className="nav nav-tabs">
        {sheets.map((sheet, index) => (
          <li className="nav-item" key={index}>
            <button
              className={`nav-link ${index === activeSheet ? 'active' : ''}`}
              onClick={() => setActiveSheet(index)}
            >
              {sheet.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Table View */}
      <div className="p-3" style={{ maxHeight: '600px', overflow: 'auto' }}>
        <table className="table table-sm table-bordered table-hover">
          <tbody>
            {currentSheet.data.map((row, i) => (
              <tr key={i}>
                {row.map((cell: any, j: number) => (
                  <td key={j} className="p-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}