declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    DB_HOST?: string;
    DB_PORT?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
    DB_SSL?: string;
    PGHOST?: string;
    PGPORT?: string;
    PGPASSWORD?: string;
    PGDATABASE?: string;
    PGSSLMODE?: string;
  }
}
