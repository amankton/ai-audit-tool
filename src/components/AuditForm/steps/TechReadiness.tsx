import React from 'react';
import { Laptop, Zap } from 'lucide-react';
import { FormField } from '../FormField';
import { TaskList } from '../TaskList';
import { FormData } from '@/hooks/useAuditForm';

interface TechReadinessProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const TechReadiness: React.FC<TechReadinessProps> = ({ data, onChange }) => {
  const updateTechReadiness = (updates: Partial<NonNullable<FormData['techReadiness']>>) => {
    onChange({
      techReadiness: {
        ...data.techReadiness,
        ...updates,
      }
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <Laptop className="mx-auto h-10 w-10 md:h-12 md:w-12 text-blue-500 mb-3 md:mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          Tell us about your technology
        </h2>
        <p className="text-sm md:text-base text-neutral-400">
          Understanding your current setup helps us recommend the right solutions
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 p-4 md:p-6 rounded-lg">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center">
          <Zap className="h-4 w-4 md:h-5 md:w-5 text-green-400 mr-2" />
          What tools and software do you currently use?
        </h3>
        <p className="text-sm md:text-base text-neutral-400 mb-3 md:mb-4">
          List the main tools your business relies on daily
        </p>
        
        <TaskList
          tasks={data.techReadiness?.currentTools || []}
          onChange={(tools) => updateTechReadiness({ currentTools: tools })}
          placeholder="e.g., QuickBooks, Salesforce, Microsoft Office"
          examples={[
            "CRM (Salesforce, HubSpot)",
            "Accounting software (QuickBooks, Xero)",
            "Email marketing (Mailchimp, Constant Contact)",
            "Project management (Asana, Trello)",
            "Communication (Slack, Microsoft Teams)",
            "Website/E-commerce (Shopify, WordPress)",
            "Social media tools",
            "Inventory management",
            "Customer support (Zendesk, Freshdesk)",
            "Analytics (Google Analytics)"
          ]}
          maxTasks={10}
        />
      </div>

      <FormField
        label="How comfortable is your team with adopting new technology?"
        type="select"
        value={data.techReadiness?.comfortLevel || ''}
        onChange={(value) => updateTechReadiness({ comfortLevel: value as 'low' | 'medium' | 'high' })}
        options={[
          { value: 'low', label: 'Low - We prefer to stick with what we know' },
          { value: 'medium', label: 'Medium - We\'re open to change with proper training' },
          { value: 'high', label: 'High - We love trying new tools and technologies' }
        ]}
        tooltip="This helps us recommend solutions that match your team's comfort level"
        optional
      />

      <div className="bg-orange-500/10 border border-orange-500/20 p-4 md:p-6 rounded-lg">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">
          What technology challenges do you face?
        </h3>
        <p className="text-sm md:text-base text-neutral-400 mb-3 md:mb-4">
          Tell us about any frustrations or limitations with your current setup
        </p>
        
        <TaskList
          tasks={data.techReadiness?.challenges || []}
          onChange={(challenges) => updateTechReadiness({ challenges })}
          placeholder="e.g., Systems don't talk to each other"
          examples={[
            "Systems don't integrate well",
            "Too many manual processes",
            "Data is scattered across tools",
            "Slow or outdated software",
            "Lack of automation",
            "Difficulty generating reports",
            "Team resistance to new tools",
            "Limited technical expertise",
            "Budget constraints",
            "Security concerns"
          ]}
          maxTasks={6}
        />
      </div>
    </div>
  );
};
