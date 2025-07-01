'use client';

import { useState } from 'react';
import styles from './FileVerification.module.css';

interface FileVerificationResponse {
  id?: number;
  filename?: string;
  fileType?: string;
  fileSize?: number;
  poseidonHash: string;
  authorAddress?: string;
  starknetTxHash?: string;
  createdAt?: string;
  isRegistered: boolean;
  starknetExplorerUrl?: string;
}

export default function FileVerification() {
  const [poseidonHash, setPoseidonHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FileVerificationResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poseidonHash) {
      setError('Please enter a Poseidon hash');
      return;
    }

    if (!poseidonHash.startsWith('0x')) {
      setError('Hash must start with 0x');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/files/verify/${poseidonHash}`);
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data: FileVerificationResponse = await response.json();
      setResult(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Verify File</h2>
      <p>Enter a Poseidon hash to verify file authorship</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="poseidon-hash">Poseidon Hash</label>
          <input
            id="poseidon-hash"
            type="text"
            value={poseidonHash}
            onChange={(e) => setPoseidonHash(e.target.value)}
            placeholder="0x1234567890abcdef..."
            className={styles.textInput}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !poseidonHash}
          className={styles.submitButton}
        >
          {loading ? 'Verifying...' : 'Verify File'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={result.isRegistered ? styles.success : styles.notFound}>
          {result.isRegistered ? (
            <>
              <h3>File Verified ✓</h3>
              <div className={styles.resultInfo}>
                <p><strong>Filename:</strong> {result.filename}</p>
                <p><strong>File Type:</strong> {result.fileType}</p>
                <p><strong>File Size:</strong> {result.fileSize ? (result.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}</p>
                <p><strong>Author:</strong> <code>{result.authorAddress}</code></p>
                <p><strong>Registered:</strong> {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown'}</p>
                {result.starknetTxHash && (
                  <p><strong>Starknet TX:</strong> <code>{result.starknetTxHash}</code></p>
                )}
                {result.starknetExplorerUrl && (
                  <p>
                    <a 
                      href={result.starknetExplorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.explorerLink}
                    >
                      View on Starknet Explorer →
                    </a>
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <h3>File Not Found</h3>
              <p>No file found with hash: <code>{result.poseidonHash}</code></p>
              <p>This file has not been registered in the system.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}