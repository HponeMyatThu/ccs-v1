use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use sqlx::SqlitePool;

use crate::models::{Agent, Page, Content};

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

#[derive(Debug, serde::Serialize)]
pub struct SearchResults {
    pub agents: Vec<Agent>,
    pub pages: Vec<Page>,
    pub contents: Vec<Content>,
}

pub async fn search_all(
    pool: web::Data<SqlitePool>,
    query: web::Query<SearchQuery>,
) -> impl Responder {
    let search_term = format!("%{}%", query.q);

    let agents = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents
         WHERE agent_number LIKE ?
         ORDER BY id DESC"
    )
    .bind(&search_term)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let pages = sqlx::query_as::<_, Page>(
        "SELECT * FROM pages
         WHERE page_name LIKE ?
         OR section_name LIKE ?
         OR lang LIKE ?
         OR content_type LIKE ?
         OR attributes LIKE ?
         ORDER BY display_order, id DESC"
    )
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let contents = sqlx::query_as::<_, Content>(
        "SELECT * FROM contents
         WHERE short_desc LIKE ?
         OR long_desc LIKE ?
         OR title LIKE ?
         OR image_path LIKE ?
         ORDER BY id DESC"
    )
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .fetch_all(pool.get_ref())
    .await
    .unwrap_or_default();

    let results = SearchResults {
        agents,
        pages,
        contents,
    };

    HttpResponse::Ok().json(results)
}

pub async fn search_pages(
    pool: web::Data<SqlitePool>,
    query: web::Query<SearchQuery>,
) -> impl Responder {
    let search_term = format!("%{}%", query.q);

    let pages = sqlx::query_as::<_, Page>(
        "SELECT * FROM pages
         WHERE page_name LIKE ?
         OR section_name LIKE ?
         OR lang LIKE ?
         OR content_type LIKE ?
         OR attributes LIKE ?
         ORDER BY display_order, id DESC"
    )
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .fetch_all(pool.get_ref())
    .await;

    match pages {
        Ok(pages) => HttpResponse::Ok().json(pages),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to search pages"
        })),
    }
}

pub async fn search_contents(
    pool: web::Data<SqlitePool>,
    query: web::Query<SearchQuery>,
) -> impl Responder {
    let search_term = format!("%{}%", query.q);

    let contents = sqlx::query_as::<_, Content>(
        "SELECT * FROM contents
         WHERE short_desc LIKE ?
         OR long_desc LIKE ?
         OR title LIKE ?
         OR image_path LIKE ?
         ORDER BY id DESC"
    )
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .bind(&search_term)
    .fetch_all(pool.get_ref())
    .await;

    match contents {
        Ok(contents) => HttpResponse::Ok().json(contents),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to search contents"
        })),
    }
}
