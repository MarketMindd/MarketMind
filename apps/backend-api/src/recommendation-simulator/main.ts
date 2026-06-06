import 'dotenv/config';
import { runRecommendationSimulation } from './recommendation-simulator.runner';

const main = async () => {
  try {
    await runRecommendationSimulation(process.argv.slice(2));
    process.exitCode = 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Recommendation simulation failed: ${message}`);
    process.exitCode = 1;
  }
};

void main();
