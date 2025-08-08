import React from 'react';
import { Target, Sparkles } from 'lucide-react';
import { FormField } from '../FormField';
import { TaskList } from '../TaskList';
import { FormData } from '@/hooks/useAuditForm';

interface AIGoalsProps {
  data: Partial<FormData>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export const AIGoals: React.FC<AIGoalsProps> = ({ data, onChange }) => {
  const updateAIGoals = (updates: Partial<NonNullable<FormData['aiGoals']>>) => {
    onChange({
      aiGoals: {
        ...data.aiGoals,
        ...updates,
      }
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <Target className="mx-auto h-10 w-10 md:h-12 md:w-12 text-blue-500 mb-3 md:mb-4" />
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          What are your AI goals?
        </h2>
        <p className="text-sm md:text-base text-neutral-400">
          Help us understand what you want to achieve with AI
        </p>
      </div>

      <FormField
        label="What's your primary objective for implementing AI?"
        type="select"
        value={data.aiGoals?.primaryObjective || ''}
        onChange={(value) => updateAIGoals({ primaryObjective: value as string })}
        options={[
          { value: 'save-time', label: 'Save time on repetitive tasks' },
          { value: 'reduce-costs', label: 'Reduce operational costs' },
          { value: 'improve-accuracy', label: 'Improve accuracy and reduce errors' },
          { value: 'scale-business', label: 'Scale business without hiring more staff' },
          { value: 'better-insights', label: 'Get better insights from data' },
          { value: 'improve-customer-experience', label: 'Improve customer experience' },
          { value: 'competitive-advantage', label: 'Gain competitive advantage' },
          { value: 'explore-possibilities', label: 'Just exploring what\'s possible' }
        ]}
        tooltip="This helps us focus on the most relevant recommendations"
        optional
      />

      <FormField
        label="What's your budget range for AI implementation?"
        type="select"
        value={data.aiGoals?.budgetRange || ''}
        onChange={(value) => updateAIGoals({ budgetRange: value as string })}
        options={[
          { value: 'under-5k', label: 'Under $5,000' },
          { value: '5k-15k', label: '$5,000 - $15,000' },
          { value: '15k-50k', label: '$15,000 - $50,000' },
          { value: '50k-100k', label: '$50,000 - $100,000' },
          { value: '100k+', label: 'Over $100,000' },
          { value: 'not-sure', label: 'Not sure yet' }
        ]}
        tooltip="This helps us recommend solutions within your budget"
        optional
      />

      <FormField
        label="What's your ideal timeline for implementation?"
        type="select"
        value={data.aiGoals?.timeline || ''}
        onChange={(value) => updateAIGoals({ timeline: value as string })}
        options={[
          { value: 'asap', label: 'As soon as possible' },
          { value: '1-3-months', label: '1-3 months' },
          { value: '3-6-months', label: '3-6 months' },
          { value: '6-12-months', label: '6-12 months' },
          { value: 'over-year', label: 'Over a year' },
          { value: 'just-exploring', label: 'Just exploring for now' }
        ]}
        tooltip="This helps us prioritize quick wins vs. long-term solutions"
        optional
      />

      <div className="bg-purple-500/10 border border-purple-500/20 p-4 md:p-6 rounded-lg">
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center">
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-purple-400 mr-2" />
          Are there specific AI use cases you're interested in?
        </h3>
        <p className="text-sm md:text-base text-neutral-400 mb-3 md:mb-4">
          Select any that sound interesting or relevant to your business
        </p>
        
        <TaskList
          tasks={data.aiGoals?.specificUseCases || []}
          onChange={(useCases) => updateAIGoals({ specificUseCases: useCases })}
          placeholder="e.g., Chatbot for customer service"
          examples={[
            "Chatbot for customer service",
            "Automated email responses",
            "Document processing and extraction",
            "Predictive analytics",
            "Inventory optimization",
            "Lead scoring and qualification",
            "Content generation",
            "Image/video analysis",
            "Voice assistants",
            "Fraud detection",
            "Personalized recommendations",
            "Automated scheduling",
            "Quality control",
            "Price optimization"
          ]}
          maxTasks={8}
        />
      </div>
    </div>
  );
};
