import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { FormField } from '../FormField';
import { TaskList } from '../TaskList';
import { FormData } from '@/hooks/useAuditForm';

interface BusinessOperationsProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const BusinessOperations: React.FC<BusinessOperationsProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <Clock className="mx-auto h-10 w-10 md:h-12 md:w-12 text-blue-500 mb-3 md:mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          How does your business operate?
        </h2>
        <p className="text-sm md:text-base text-neutral-400">
          Help us understand your daily workflows and challenges
        </p>
      </div>

      <FormField
        label="What are your main business goals right now?"
        type="multiselect"
        value={data.businessGoals || []}
        onChange={(value) => onChange({ businessGoals: value as string[] })}
        options={[
          { value: 'grow-revenue', label: 'Grow revenue and sales' },
          { value: 'reduce-costs', label: 'Reduce operating costs' },
          { value: 'improve-efficiency', label: 'Work more efficiently' },
          { value: 'better-customer-service', label: 'Improve customer service' },
          { value: 'scale-operations', label: 'Scale operations without hiring' },
          { value: 'reduce-errors', label: 'Reduce mistakes and errors' },
          { value: 'improve-quality', label: 'Improve product/service quality' },
          { value: 'expand-market', label: 'Expand to new markets' },
          { value: 'digital-transformation', label: 'Digital transformation' },
          { value: 'competitive-advantage', label: 'Gain competitive advantage' }
        ]}
        tooltip="Select all that apply - this helps us prioritize recommendations"
      />

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 md:p-6 rounded-lg">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-400 mr-2" />
          What takes up too much of your time?
        </h3>
        <p className="text-sm md:text-base text-neutral-400 mb-3 md:mb-4">
          Think about tasks that are repetitive, time-consuming, or frustrating
        </p>
        
        <TaskList
          tasks={data.timeConsumingTasks || []}
          onChange={(tasks) => onChange({ timeConsumingTasks: tasks })}
          placeholder="e.g., Entering customer information into spreadsheets"
          examples={[
            "Data entry and paperwork",
            "Scheduling appointments",
            "Following up with customers",
            "Creating reports",
            "Managing inventory",
            "Processing invoices",
            "Email management",
            "Social media posting",
            "Customer support tickets",
            "Expense tracking"
          ]}
          maxTasks={8}
        />
      </div>

      <FormField
        label="How much time per week do you spend on repetitive tasks?"
        type="select"
        value={data.repetitiveTaskTime || ''}
        onChange={(value) => onChange({ repetitiveTaskTime: value as string })}
        options={[
          { value: '0-5', label: 'Less than 5 hours' },
          { value: '5-15', label: '5-15 hours' },
          { value: '15-25', label: '15-25 hours' },
          { value: '25-40', label: '25-40 hours' },
          { value: '40+', label: 'More than 40 hours' },
          { value: 'not-sure', label: "I'm not sure" }
        ]}
        tooltip="Include time spent by you and your team on routine tasks"
        optional
      />
    </div>
  );
};
