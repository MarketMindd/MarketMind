import {
  AiRecommendation,
  aiRecommendationSchema,
  recommendationStatusSchema,
  RiskTolerance,
} from '@market-mind/common';
import { z } from 'zod';

const supportedFlags = [
  'symbol',
  'riskTolerance',
  'status',
  'confidence',
  'rationale',
  'generatedAt',
] as const;

const supportedFlagSet = new Set<string>(supportedFlags);

const recommendationSimulationSchema = aiRecommendationSchema.extend({
  symbol: z.string().trim().min(1, 'symbol is required'),
  riskTolerance: z.nativeEnum(RiskTolerance),
  status: recommendationStatusSchema,
  confidence: z.coerce.number().min(0).max(1),
  rationale: z.string().trim().min(1, 'rationale is required'),
  generatedAt: z.coerce.date().default(() => new Date()),
});

type RecommendationSimulationInput = z.input<typeof recommendationSimulationSchema>;

const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'value';
      return `${path}: ${issue.message}`;
    })
    .join('; ');

const parseArgumentMap = (argv: string[]): Record<string, string> => {
  const parsedArgs: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument "${token}". Expected a flag such as --symbol.`);
    }

    const flagName = token.slice(2);

    if (!supportedFlagSet.has(flagName)) {
      throw new Error(
        `Unknown flag "--${flagName}". Supported flags: ${supportedFlags.map((flag) => `--${flag}`).join(', ')}`,
      );
    }

    if (Object.hasOwn(parsedArgs, flagName)) {
      throw new Error(`Flag "--${flagName}" was provided more than once.`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Flag "--${flagName}" requires a value.`);
    }

    parsedArgs[flagName] = value;
    index += 1;
  }

  return parsedArgs;
};

export const parseRecommendationSimulationArgs = (argv: string[]): AiRecommendation => {
  const parsedArgs = parseArgumentMap(argv);
  const input: RecommendationSimulationInput = {
    symbol: parsedArgs.symbol,
    riskTolerance: parsedArgs.riskTolerance as RiskTolerance | undefined,
    status: parsedArgs.status,
    confidence: parsedArgs.confidence,
    rationale: parsedArgs.rationale,
    generatedAt: parsedArgs.generatedAt,
  };

  const result = recommendationSimulationSchema.safeParse(input);

  if (!result.success) {
    throw new Error(`Invalid recommendation arguments: ${formatZodError(result.error)}`);
  }

  return result.data;
};
