'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import FileVerification from '@/components/FileVerification';
import FileList from '@/components/FileList';
import styles from './page.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'verify' | 'list'>('upload');

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>ZK File Authentication</h1>
          <p>Authenticate file authorship using Zero-Knowledge proofs on Starknet</p>
        </div>

        <nav className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload File
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'verify' ? styles.active : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify File
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`}
            onClick={() => setActiveTab('list')}
          >
            All Files
          </button>
        </nav>

        <div className={styles.content}>
          {activeTab === 'upload' && <FileUpload />}
          {activeTab === 'verify' && <FileVerification />}
          {activeTab === 'list' && <FileList />}
        </div>
      </main>
    </div>
  );
}