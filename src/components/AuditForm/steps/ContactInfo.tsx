import React from 'react';
import { Mail, User, Phone, Shield } from 'lucide-react';
import { FormField } from '../FormField';
import { FormData } from '@/hooks/useAuditForm';
import { formatPhoneNumber } from '@/lib/utils';

interface ContactInfoProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <Mail className="mx-auto h-10 w-10 md:h-12 md:w-12 text-blue-500 mb-3 md:mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          Get your personalized AI audit report
        </h2>
        <p className="text-sm md:text-base text-neutral-400">
          We'll send you a detailed report with actionable recommendations
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 md:p-6 rounded-lg border border-blue-500/20">
        <h3 className="text-base md:text-lg font-semibold text-white mb-2">
          🎯 Your report will include:
        </h3>
        <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-neutral-300">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
            Personalized AI recommendations for your industry
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
            ROI estimates and implementation timelines
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
            Specific tools and solutions for your use cases
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0" />
            Step-by-step implementation roadmap
          </li>
        </ul>
      </div>

      <FormField
        label="Email address"
        type="email"
        required
        value={data.email || ''}
        onChange={(value) => onChange({ email: value as string })}
        placeholder="your.email@company.com"
        tooltip="We'll send your personalized AI audit report to this email"
      />

      <FormField
        label="Full name"
        value={data.fullName || ''}
        onChange={(value) => onChange({ fullName: value as string })}
        placeholder="John Smith"
        tooltip="This helps us personalize your report"
        optional
      />

      <FormField
        label="Phone number"
        type="tel"
        value={data.phone || ''}
        onChange={(value) => {
          const formatted = formatPhoneNumber(value as string);
          onChange({ phone: formatted });
        }}
        placeholder="(555) 123-4567"
        tooltip="Optional - only if you'd like us to call you about implementation"
        optional
      />

      <FormField
        label="Preferred contact method"
        type="select"
        value={data.preferredContact || ''}
        onChange={(value) => onChange({ preferredContact: value as 'email' | 'phone' })}
        options={[
          { value: 'email', label: 'Email only' },
          { value: 'phone', label: 'Phone call preferred' }
        ]}
        optional
      />

      {/* Marketing Consent */}
      <div className="bg-neutral-800/40 border border-neutral-700 p-6 rounded-lg">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="marketing-consent"
            checked={data.marketingConsent || false}
            onChange={(e) => onChange({ marketingConsent: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-600 rounded bg-neutral-700"
          />
          <div className="flex-1">
            <label htmlFor="marketing-consent" className="text-sm font-medium text-white cursor-pointer">
              Keep me updated on AI trends and solutions
            </label>
            <p className="text-sm text-neutral-400 mt-1">
              Receive occasional emails about new AI tools, case studies, and implementation tips.
              You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
        <div className="flex items-center mb-2">
          <Shield className="h-5 w-5 text-green-400 mr-2" />
          <h4 className="text-sm font-semibold text-green-300">Your privacy is protected</h4>
        </div>
        <p className="text-sm text-green-400">
          We never share your information with third parties. Your data is used solely to generate
          your personalized AI audit report and improve our recommendations.
        </p>
      </div>

      {/* Delivery Timeline */}
      <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>⚡ Fast delivery:</strong> You'll receive your detailed AI audit report within 24 hours
        </p>
      </div>
    </div>
  );
};
