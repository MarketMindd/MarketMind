export class PortfolioEntity {
  id!: string;
  userId!: string;
  holdings!: PortfolioHoldingEntity[];
  createdAt!: Date;
  updatedAt!: Date;
}

export class PortfolioHoldingEntity {
  id!: string;
  portfolioId!: string;
  symbol!: string;
  companyName!: string;
  shares!: string;
  avgCost!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
