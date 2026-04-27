export interface Step {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface OnboardingProps {
  onComplete: () => void;
}