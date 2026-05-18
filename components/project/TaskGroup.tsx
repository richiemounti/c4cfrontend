// components/project/TaskGroup.tsx
import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '@/types';

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  step: number;
  onTaskComplete: (taskId: string, responseData: any, files?: File[]) => Promise<void>; // ✅ Changed
  onTaskUpdate: (taskId: string, responseData: any, files?: File[]) => Promise<void>; // ✅ Changed
  isDisabled?: boolean;
}

const TaskGroup: React.FC<TaskGroupProps> = ({
  title,
  tasks,
  step,
  onTaskComplete,
  onTaskUpdate,
  isDisabled = false,
}) => {
  const filteredTasks = tasks.filter((task) => task.step === step);
  const completedTasks = filteredTasks.filter((task) => task.isCompleted).length;
  const totalTasks = filteredTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (filteredTasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-sm text-gray-500">
          {completedTasks} of {totalTasks} tasks completed ({Math.round(progress)}%)
        </div>
      </div>
      <div className="space-y-2">
        {filteredTasks
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onTaskComplete={onTaskComplete}
              onTaskUpdate={onTaskUpdate}
              isDisabled={isDisabled}
            />
          ))}
      </div>
    </div>
  );
};

export default TaskGroup;