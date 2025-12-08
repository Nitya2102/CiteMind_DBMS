import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TopicTagProps {
  label: string;
  onClick?: () => void;
}

export const TopicTag = ({ label, onClick }: TopicTagProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Badge
        variant="secondary"
        className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={onClick}
      >
        {label}
      </Badge>
    </motion.div>
  );
};
