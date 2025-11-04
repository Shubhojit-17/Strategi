'use client';

import React, { Suspense } from 'react';
import { ExecutionGateway } from '@/components/ai/ExecutionGateway';

function ExecuteContent() {
  return <ExecutionGateway />;
}

export default function ExecutePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background text-white">Loading...</div>}>
      <ExecuteContent />
    </Suspense>
  );
}
