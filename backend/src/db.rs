use sqlx::{sqlite::SqlitePool, migrate::MigrateDatabase, Sqlite};
use std::env;

pub async fn init_db() -> Result<SqlitePool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    if !Sqlite::database_exists(&database_url).await.unwrap_or(false) {
        println!("Creating database {}", database_url);
        Sqlite::create_database(&database_url).await?;
    }

    let pool = SqlitePool::connect(&database_url).await?;

    let migration_sql = include_str!("../migrations/001_init.sql");
    sqlx::query(migration_sql).execute(&pool).await?;

    println!("Database initialized successfully");
    Ok(pool)
}
