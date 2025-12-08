import { SearchBar } from "@/components/SearchBar";
import { TopicTag } from "@/components/TopicTag";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const suggestedTopics = [
  "Artificial Intelligence",
  "Quantum Computing",
  "Cybersecurity",
  "Machine Learning",
  "Blockchain",
  "Neural Networks",
  "Natural Language Processing",
  "Computer Vision",
];

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleTopicClick = (topic: string) => {
    navigate(`/search?q=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl text-center space-y-12"
      >
        <div className="space-y-4">
          <h1 className="text-6xl font-serif font-bold text-balance">
            CiteMind
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Because knowledge is more than keywords — it's connections.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Popular Topics
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedTopics.map((topic, index) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <TopicTag label={topic} onClick={() => handleTopicClick(topic)} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
