import React from 'react';
import { HelpCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  label: string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  type?: 'text' | 'email' | 'url' | 'tel' | 'select' | 'multiselect' | 'textarea';
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  tooltip?: string;
  options?: Option[];
  error?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value = '',
  onChange,
  type = 'text',
  placeholder,
  required = false,
  optional = false,
  tooltip,
  options = [],
  error,
  className,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };
  
  const handleMultiSelectChange = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(newValues);
  };
  
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            rows={4}
            className={cn(
              "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-neutral-400 resize-none",
              error && "border-red-500 focus:ring-red-500"
            )}
            style={{
              background: 'rgba(17, 23, 37, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          />
        );
        
      case 'select':
        return (
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={handleInputChange}
            className={cn(
              "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none text-white",
              error && "border-red-500 focus:ring-red-500"
            )}
            style={{
              background: 'rgba(17, 23, 37, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <option value="" style={{ background: '#111725', color: 'white' }}>{placeholder || 'Select an option...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value} style={{ background: '#111725', color: 'white' }}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'multiselect':
        return (
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = Array.isArray(value) && value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                    isSelected ? "border-blue-500" : ""
                  )}
                  style={{
                    background: isSelected
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(17, 23, 37, 0.4)',
                    borderColor: isSelected
                      ? '#3b82f6'
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(17, 23, 37, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(17, 23, 37, 0.4)';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMultiSelectChange(option.value)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 border-2 rounded mr-3 transition-colors",
                    isSelected ? "border-blue-500 bg-blue-500" : "border-neutral-600"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-white">{option.label}</span>
                </label>
              );
            })}
          </div>
        );
        
      default:
        return (
          <input
            type={type}
            value={typeof value === 'string' ? value : ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-neutral-400",
              error && "border-red-500 focus:ring-red-500"
            )}
            style={{
              background: 'rgba(17, 23, 37, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          />
        );
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
          {optional && <span className="text-neutral-400 ml-1">(optional)</span>}
        </label>
        
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-neutral-400 hover:text-neutral-300 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {showTooltip && (
              <div
                className="absolute right-0 top-6 z-10 w-64 p-3 text-white text-sm rounded-lg shadow-lg"
                style={{
                  background: 'rgba(17, 23, 37, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {tooltip}
                <div
                  className="absolute -top-1 right-4 w-2 h-2 rotate-45"
                  style={{
                    background: 'rgba(17, 23, 37, 0.95)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
