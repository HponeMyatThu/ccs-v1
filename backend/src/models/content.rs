use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Content {
    pub id: i64,
    pub ref_id: i64,
    pub short_desc: Option<String>,
    pub long_desc: Option<String>,
    pub image_path: Option<String>,
    pub title: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct ContentCreate {
    pub ref_id: i64,
    pub short_desc: Option<String>,
    pub long_desc: Option<String>,
    pub image_path: Option<String>,
    pub title: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ContentUpdate {
    pub ref_id: Option<i64>,
    pub short_desc: Option<String>,
    pub long_desc: Option<String>,
    pub image_path: Option<String>,
    pub title: Option<String>,
}
