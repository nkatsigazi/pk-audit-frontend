import { useState, type ChangeEvent } from 'react'; // Fixed TS1484
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:3000/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File uploaded successfully');
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    }
  };

  return (
    <div className="card p-3 shadow-sm">
      <h5 className="mb-3">Document Upload</h5>
      <div className="input-group">
        <input 
          type="file" 
          className="form-control" 
          onChange={handleFileChange} 
        />
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
      </div>
      {file && <small className="text-muted mt-2 d-block">Selected: {file.name}</small>}
    </div>
  );
};

export default FileUpload;