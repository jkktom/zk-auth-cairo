'use client';

import { useState } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadResponse {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  poseidonHash: string;
  authorAddress: string;
  starknetTxHash?: string;
  createdAt: string;
  message: string;
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [authorAddress, setAuthorAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FileUploadResponse | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !authorAddress) {
      setError('Please select a file and enter an author address');
      return;
    }

    if (!authorAddress.startsWith('0x') || authorAddress.length !== 66) {
      setError('Please enter a valid Starknet address (0x followed by 64 hex characters)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('authorAddress', authorAddress);

      const response = await fetch('http://localhost:8080/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: FileUploadResponse = await response.json();
      setResult(data);
      setFile(null);
      setAuthorAddress('');
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Upload File</h2>
      <p>Upload a file (max 10MB) to register its authorship on Starknet</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="file-input">Select File</label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept="*/*"
            className={styles.fileInput}
          />
          {file && (
            <div className={styles.fileInfo}>
              <p><strong>File:</strong> {file.name}</p>
              <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="author-address">Starknet Author Address</label>
          <input
            id="author-address"
            type="text"
            value={authorAddress}
            onChange={(e) => setAuthorAddress(e.target.value)}
            placeholder="0x1234567890abcdef..."
            className={styles.textInput}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !file || !authorAddress}
          className={styles.submitButton}
        >
          {loading ? 'Uploading...' : 'Upload & Register'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={styles.success}>
          <h3>File Registered Successfully!</h3>
          <div className={styles.resultInfo}>
            <p><strong>Filename:</strong> {result.filename}</p>
            <p><strong>Poseidon Hash:</strong> <code>{result.poseidonHash}</code></p>
            <p><strong>Author:</strong> <code>{result.authorAddress}</code></p>
            {result.starknetTxHash && (
              <p><strong>Starknet TX:</strong> <code>{result.starknetTxHash}</code></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}