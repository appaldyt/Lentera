import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateOverallProgress(preparations: { progress: string }[]): number {
  if (!preparations || preparations.length === 0) return 0;
  
  const totalProgress = preparations.reduce((sum, task) => {
    const percentage = parseInt(task.progress.replace("%", ""), 10) || 0;
    return sum + percentage;
  }, 0);
  
  return Math.round(totalProgress / preparations.length);
}
