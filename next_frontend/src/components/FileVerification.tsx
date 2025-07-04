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
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({});

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

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
                <p>
                  <strong>Author:</strong> 
                  <code style={{ marginLeft: '8px', marginRight: '8px' }}>{result.authorAddress}</code>
                  <button 
                    onClick={() => copyToClipboard(result.authorAddress!, 'author')}
                    style={{ 
                      marginLeft: '8px', 
                      padding: '2px 6px', 
                      fontSize: '10px',
                      background: 'var(--gray-alpha-100)',
                      border: '1px solid var(--gray-alpha-200)',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Copy author address"
                  >
                    {copySuccess['author'] ? '✓' : '📋'}
                  </button>
                </p>
                <p><strong>Registered:</strong> {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown'}</p>
                {result.starknetTxHash && (
                  <p>
                    <strong>Starknet TX:</strong> 
                    <code style={{ marginLeft: '8px', marginRight: '8px' }}>{result.starknetTxHash}</code>
                    <button 
                      onClick={() => copyToClipboard(result.starknetTxHash!, 'txhash')}
                      style={{ 
                        marginLeft: '8px', 
                        padding: '2px 6px', 
                        fontSize: '10px',
                        background: 'var(--gray-alpha-100)',
                        border: '1px solid var(--gray-alpha-200)',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                      title="Copy transaction hash"
                    >
                      {copySuccess['txhash'] ? '✓' : '📋'}
                    </button>
                  </p>
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
              <p>
                No file found with hash: 
                <code style={{ marginLeft: '8px', marginRight: '8px' }}>{result.poseidonHash}</code>
                <button 
                  onClick={() => copyToClipboard(result.poseidonHash, 'notfound')}
                  style={{ 
                    marginLeft: '8px', 
                    padding: '2px 6px', 
                    fontSize: '10px',
                    background: 'var(--gray-alpha-100)',
                    border: '1px solid var(--gray-alpha-200)',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                  title="Copy hash"
                >
                  {copySuccess['notfound'] ? '✓' : '📋'}
                </button>
              </p>
              <p>This file has not been registered in the system.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}