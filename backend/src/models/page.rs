use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Page {
    pub id: i64,
    pub page_name: String,
    pub section_name: String,
    pub lang: String,
    pub content_type: String,
    pub visible: bool,
    pub display_order: i32,
    pub attributes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct PageCreate {
    pub page_name: String,
    pub section_name: String,
    pub lang: String,
    pub content_type: String,
    pub visible: Option<bool>,
    pub display_order: Option<i32>,
    pub attributes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PageUpdate {
    pub page_name: Option<String>,
    pub section_name: Option<String>,
    pub lang: Option<String>,
    pub content_type: Option<String>,
    pub visible: Option<bool>,
    pub display_order: Option<i32>,
    pub attributes: Option<String>,
}
