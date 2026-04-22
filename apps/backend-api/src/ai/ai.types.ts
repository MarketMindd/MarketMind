import { RiskTolerance } from '@market-mind/common';
import { FilteredSnapshot } from '../filter/filter.types.js';

export interface RiskGroup {
  riskTolerance: RiskTolerance;
  snapshot: FilteredSnapshot;
}
