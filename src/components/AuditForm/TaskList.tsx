import React, { useState } from 'react';
import { Plus, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: string[];
  onChange: (tasks: string[]) => void;
  placeholder?: string;
  examples?: string[];
  maxTasks?: number;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks = [],
  onChange,
  placeholder = "Add a task...",
  examples = [],
  maxTasks = 10,
  className,
}) => {
  const [newTask, setNewTask] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  
  const addTask = () => {
    if (newTask.trim() && tasks.length < maxTasks) {
      onChange([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };
  
  const removeTask = (index: number) => {
    onChange(tasks.filter((_, i) => i !== index));
  };
  
  const addExampleTask = (example: string) => {
    if (!tasks.includes(example) && tasks.length < maxTasks) {
      onChange([...tasks, example]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-neutral-800/40 border border-neutral-700 rounded-lg group hover:bg-neutral-800/60 transition-colors"
            >
              <span className="text-white flex-1">{task}</span>
              <button
                type="button"
                onClick={() => removeTask(index)}
                className="text-neutral-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add New Task */}
      {tasks.length < maxTasks && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-neutral-400"
          />
          <button
            type="button"
            onClick={addTask}
            disabled={!newTask.trim()}
            className={cn(
              "px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2",
              !newTask.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      )}
      
      {/* Examples */}
      {examples.length > 0 && (
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {showExamples ? 'Hide' : 'Show'} examples
          </button>
          
          {showExamples && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-neutral-400">Click to add:</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((example, index) => (
                  <button
                    key={`example-${index}`}
                    type="button"
                    onClick={() => addExampleTask(example)}
                    disabled={tasks.includes(example) || tasks.length >= maxTasks}
                    className={cn(
                      "px-3 py-1 text-sm border border-neutral-600 rounded-full hover:bg-neutral-800 transition-colors text-neutral-300",
                      (tasks.includes(example) || tasks.length >= maxTasks) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Task Count */}
      <div className="text-sm text-neutral-400 text-right">
        {tasks.length} / {maxTasks} tasks
      </div>
    </div>
  );
};
