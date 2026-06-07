import { DataSourceOptions } from 'typeorm';
import { getDatabaseConfig } from '../config/database.config';
import { MarketDataEntity } from '../entities/market-data.entity';
import { PortfolioEntity } from '../entities/portfolio.entity';
import { RecommendationEntity } from '../entities/recommendation.entity';
import { StockEntity } from '../entities/stock.entity';
import { SymbolFilterStateEntity } from '../entities/symbol-filter-state.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { ChatSessionEntity } from '../entities/chat-session.entity';
import { ChatMessageEntity } from '../entities/chat-message.entity';

export const createDataSourceOptions = (): DataSourceOptions => {
  const dbEnv = getDatabaseConfig();

  return {
    type: 'postgres',
    host: dbEnv.host,
    port: dbEnv.port,
    username: dbEnv.username,
    password: dbEnv.password,
    database: dbEnv.database,
    ssl: dbEnv.ssl,
    synchronize: false,
    logging: false,
    entities: [
      UserProfileEntity,
      StockEntity,
      PortfolioEntity,
      MarketDataEntity,
      SymbolFilterStateEntity,
      RecommendationEntity,
      ChatSessionEntity,
      ChatMessageEntity,
    ],
    migrations: ['./src/migrations/[0-9]*-*.ts'],
    migrationsTableName: 'migrations',
  };
};
