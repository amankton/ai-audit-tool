import React from 'react';
import { Building2 } from 'lucide-react';
import { FormField } from '../FormField';
import { FormData } from '@/hooks/useAuditForm';

interface CompanyBasicsProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const CompanyBasics: React.FC<CompanyBasicsProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-5">
      <div className="text-center mb-3 md:mb-4">
        <Building2 className="mx-auto h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-blue-500 mb-2 md:mb-3" />
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 md:mb-2">
          Tell us about your business
        </h2>
        <p className="text-xs md:text-sm lg:text-base text-neutral-400">
          We'll use this to give you personalized recommendations
        </p>
      </div>

      <FormField
        label="What's your company name?"
        required
        value={data.companyName || ''}
        onChange={(value) => onChange({ companyName: value as string })}
        placeholder="e.g., Smith & Associates"
      />

      <FormField
        label="What industry are you in?"
        type="select"
        required
        value={data.industry || ''}
        onChange={(value) => onChange({ industry: value as string })}
        options={[
          { value: 'professional-services', label: 'Professional Services (Law, Accounting, Consulting)' },
          { value: 'healthcare', label: 'Healthcare & Medical' },
          { value: 'retail', label: 'Retail & E-commerce' },
          { value: 'manufacturing', label: 'Manufacturing & Production' },
          { value: 'real-estate', label: 'Real Estate' },
          { value: 'technology', label: 'Technology & Software' },
          { value: 'finance', label: 'Finance & Banking' },
          { value: 'education', label: 'Education & Training' },
          { value: 'hospitality', label: 'Hospitality & Tourism' },
          { value: 'construction', label: 'Construction & Engineering' },
          { value: 'other', label: 'Other' }
        ]}
        tooltip="This helps us understand your specific business challenges"
      />

      <FormField
        label="How many people work at your company?"
        type="select"
        required
        value={data.employeeCount || ''}
        onChange={(value) => onChange({ employeeCount: value as string })}
        options={[
          { value: '1-5', label: 'Just me (1-5 people)' },
          { value: '6-25', label: 'Small team (6-25 people)' },
          { value: '26-100', label: 'Growing company (26-100 people)' },
          { value: '101-500', label: 'Established business (101-500 people)' },
          { value: '500+', label: 'Large organization (500+ people)' }
        ]}
      />

      <FormField
        label="What's your approximate annual revenue?"
        type="select"
        value={data.revenue || ''}
        onChange={(value) => onChange({ revenue: value as string })}
        options={[
          { value: 'under-500k', label: 'Under $500K' },
          { value: '500k-2m', label: '$500K - $2M' },
          { value: '2m-10m', label: '$2M - $10M' },
          { value: '10m-50m', label: '$10M - $50M' },
          { value: '50m+', label: 'Over $50M' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say' }
        ]}
        tooltip="This is optional and helps us understand your investment capacity"
        optional
      />

      <FormField
        label="Company website (optional)"
        type="url"
        value={data.website || ''}
        onChange={(value) => onChange({ website: value as string })}
        placeholder="https://yourcompany.com"
        tooltip="We may use this to better understand your business"
        optional
      />
    </div>
  );
};
