use actix_web::{web, HttpResponse, Responder};
use sqlx::SqlitePool;

use crate::models::{Page, PageCreate, PageUpdate};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PageQuery {
    pub section_name: Option<String>,
}
pub async fn create_page(
    pool: web::Data<SqlitePool>,
    page_data: web::Json<PageCreate>,
) -> impl Responder {
    let visible = page_data.visible.unwrap_or(true);
    let display_order = page_data.display_order.unwrap_or(0);

    let result = sqlx::query(
        "INSERT INTO pages (page_name, section_name, lang, content_type, visible, display_order, attributes)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&page_data.page_name)
    .bind(&page_data.section_name)
    .bind(&page_data.lang)
    .bind(&page_data.content_type)
    .bind(visible)
    .bind(display_order)
    .bind(&page_data.attributes)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(result) => {
            let page_id = result.last_insert_rowid();
            HttpResponse::Created().json(serde_json::json!({
                "id": page_id,
                "message": "Page created successfully"
            }))
        }
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to create page"
        })),
    }
}

pub async fn get_pages(
    pool: web::Data<SqlitePool>,
    query: web::Query<PageQuery>,
) -> impl Responder {

    let result = if let Some(section_name) = &query.section_name {
        sqlx::query_as::<_, Page>(
            "SELECT * FROM pages WHERE section_name = ? ORDER BY display_order, id DESC"
        )
        .bind(section_name)
        .fetch_all(pool.get_ref())
        .await
    } else {
        sqlx::query_as::<_, Page>(
            "SELECT * FROM pages ORDER BY display_order, id DESC"
        )
        .fetch_all(pool.get_ref())
        .await
    };

    match result {
        Ok(pages) => HttpResponse::Ok().json(pages),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch pages"
        })),
    }
}

pub async fn get_page(
    pool: web::Data<SqlitePool>,
    page_id: web::Path<i64>,
) -> impl Responder {
    let page = sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE id = ?")
        .bind(*page_id)
        .fetch_optional(pool.get_ref())
        .await;

    match page {
        Ok(Some(page)) => HttpResponse::Ok().json(page),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Page not found"
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        })),
    }
}

pub async fn update_page(
    pool: web::Data<SqlitePool>,
    page_id: web::Path<i64>,
    page_data: web::Json<PageUpdate>,
) -> impl Responder {
    let existing_page = sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE id = ?")
        .bind(*page_id)
        .fetch_optional(pool.get_ref())
        .await;

    let existing = match existing_page {
        Ok(Some(page)) => page,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Page not found"
            }))
        }
        Err(_) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            }))
        }
    };

    let page_name = page_data.page_name.as_ref().unwrap_or(&existing.page_name);
    let section_name = page_data.section_name.as_ref().unwrap_or(&existing.section_name);
    let lang = page_data.lang.as_ref().unwrap_or(&existing.lang);
    let content_type = page_data.content_type.as_ref().unwrap_or(&existing.content_type);
    let visible = page_data.visible.unwrap_or(existing.visible);
    let display_order = page_data.display_order.unwrap_or(existing.display_order);
    let attributes = page_data.attributes.as_ref().or(existing.attributes.as_ref());

    let result = sqlx::query(
        "UPDATE pages SET page_name = ?, section_name = ?, lang = ?, content_type = ?,
         visible = ?, display_order = ?, attributes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?"
    )
    .bind(page_name)
    .bind(section_name)
    .bind(lang)
    .bind(content_type)
    .bind(visible)
    .bind(display_order)
    .bind(attributes)
    .bind(*page_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Page updated successfully"
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to update page"
        })),
    }
}

pub async fn delete_page(
    pool: web::Data<SqlitePool>,
    page_id: web::Path<i64>,
) -> impl Responder {
    let result = sqlx::query("DELETE FROM pages WHERE id = ?")
        .bind(*page_id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                HttpResponse::Ok().json(serde_json::json!({
                    "message": "Page deleted successfully"
                }))
            } else {
                HttpResponse::NotFound().json(serde_json::json!({
                    "error": "Page not found"
                }))
            }
        }
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to delete page"
        })),
    }
}
