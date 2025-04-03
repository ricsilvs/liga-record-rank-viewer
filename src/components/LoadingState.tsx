import { Progress } from "@/components/ui/progress";

interface LoadingStateProps {
  progress: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ progress }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-sm">
      <div>Loading rankings data...</div>
      <Progress value={progress} className="w-full" />
      <div className="text-sm text-muted-foreground">{progress}%</div>
    </div>
  );
};

export default LoadingState;
