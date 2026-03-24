import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TourHelpButtonProps {
  onClick: () => void;
  label?: string;
}

const TourHelpButton = ({ onClick, label = 'Ver tutorial' }: TourHelpButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          className="h-9 w-9 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TourHelpButton;
