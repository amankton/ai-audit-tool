import React from 'react';
import { useFormStore } from '@/hooks/useAuditForm';

export const DebugPanel: React.FC = () => {
  const { formData, currentStep, isValid, completionScore, validationErrors } = useFormStore();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Step: {currentStep}</div>
        <div>Valid: {isValid ? '✅' : '❌'}</div>
        <div>Score: {completionScore}%</div>
        <div>Company Name: {formData.companyName || 'empty'}</div>
        <div>Industry: {formData.industry || 'empty'}</div>
        <div>Employee Count: {formData.employeeCount || 'empty'}</div>
        {Object.keys(validationErrors || {}).length > 0 && (
          <div>
            <div className="font-bold text-red-400">Errors:</div>
            {Object.entries(validationErrors || {}).map(([key, error]) => (
              <div key={key} className="text-red-300">{key}: {error}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
