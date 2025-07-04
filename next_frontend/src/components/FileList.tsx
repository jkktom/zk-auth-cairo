'use client';

import { useState, useEffect } from 'react';
import styles from './FileList.module.css';

interface FileVerificationResponse {
  id: number;
  filename: string;
  fileType: string;
  fileSize: number;
  poseidonHash: string;
  authorAddress: string;
  starknetTxHash?: string;
  createdAt: string;
  isRegistered: boolean;
  starknetExplorerUrl?: string;
}

export default function FileList() {
  const [files, setFiles] = useState<FileVerificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/v1/files/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data: FileVerificationResponse[] = await response.json();
      setFiles(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const [showFullHash, setShowFullHash] = useState<{[key: number]: boolean}>({});
  const [showFullAddress, setShowFullAddress] = useState<{[key: number]: boolean}>({});
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({});

  const toggleHashDisplay = (fileId: number) => {
    setShowFullHash(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const toggleAddressDisplay = (fileId: number) => {
    setShowFullAddress(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

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

  const formatDisplayText = (text: string, isShown: boolean) => {
    if (isShown || text.length <= 20) {
      return text;
    }
    return text.substring(0, 10) + '...' + text.substring(text.length - 8);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2>All Registered Files</h2>
        <div className={styles.loading}>Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>All Registered Files</h2>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchFiles} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>All Registered Files</h2>
        <button onClick={fetchFiles} className={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {files.length === 0 ? (
        <div className={styles.empty}>
          <p>No files have been registered yet.</p>
        </div>
      ) : (
        <div className={styles.fileGrid}>
          {files.map((file) => (
            <div key={file.id} className={styles.fileCard}>
              <div className={styles.cardHeader}>
                <h3>{file.filename}</h3>
                <span className={styles.fileType}>{file.fileType}</span>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Size:</span>
                  <span>{formatFileSize(file.fileSize)}</span>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.label}>Hash:</span>
                  <div className={styles.hashContainer}>
                    <code 
                      className={styles.hash}
                      onClick={() => toggleHashDisplay(file.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {formatDisplayText(file.poseidonHash, showFullHash[file.id])}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(file.poseidonHash, `hash-${file.id}`)}
                      className={styles.copyButton}
                      title="Copy hash"
                    >
                      {copySuccess[`hash-${file.id}`] ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.label}>Author:</span>
                  <div className={styles.addressContainer}>
                    <code 
                      className={styles.address}
                      onClick={() => toggleAddressDisplay(file.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {formatDisplayText(file.authorAddress, showFullAddress[file.id])}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(file.authorAddress, `address-${file.id}`)}
                      className={styles.copyButton}
                      title="Copy address"
                    >
                      {copySuccess[`address-${file.id}`] ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
                
                <div className={styles.infoRow}>
                  <span className={styles.label}>Registered:</span>
                  <span>{formatDate(file.createdAt)}</span>
                </div>
                
                {file.starknetTxHash && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>TX Hash:</span>
                    <div className={styles.hashContainer}>
                      <code 
                        className={styles.hash}
                        onClick={() => toggleHashDisplay(`tx-${file.id}` as any)}
                        style={{ cursor: 'pointer' }}
                      >
                        {formatDisplayText(file.starknetTxHash, showFullHash[`tx-${file.id}` as any])}
                      </code>
                      <button 
                        onClick={() => copyToClipboard(file.starknetTxHash, `tx-${file.id}`)}
                        className={styles.copyButton}
                        title="Copy transaction hash"
                      >
                        {copySuccess[`tx-${file.id}`] ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.cardFooter}>
                {file.starknetExplorerUrl && (
                  <a 
                    href={file.starknetExplorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.explorerLink}
                  >
                    View on Explorer
                  </a>
                )}
                <button 
                  onClick={() => copyToClipboard(file.poseidonHash, `main-hash-${file.id}`)}
                  className={styles.copyButton}
                >
                  {copySuccess[`main-hash-${file.id}`] ? 'Copied!' : 'Copy Hash'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}