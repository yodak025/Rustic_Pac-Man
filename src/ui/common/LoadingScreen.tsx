'use client'

import React from 'react';
import PageTitle from '@/ui/components/PageTitle';
import ProgressBar from '@/ui/components/ProgressBar';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-5000 flex flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-text-light)]">
      <PageTitle>RUSTIC PAC-MAN</PageTitle>
      
      <div className="flex flex-col items-center space-y-6">
        <p className="text-2xl font-mono font-bold tracking-wide text-[var(--color-primary-light)]">
          LOADING...
        </p>
        
        <ProgressBar progress={50} animated />
      </div>
    </div>
  );
};

export default LoadingScreen;