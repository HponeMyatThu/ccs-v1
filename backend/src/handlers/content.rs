use actix_web::{web, HttpResponse, Responder};
use sqlx::SqlitePool;
use std::path::Path;

use crate::{
    config::AppConfig,
    models::{Content, ContentCreate, ContentUpdate},
};

pub async fn create_content(
    pool: web::Data<SqlitePool>,
    content_data: web::Json<ContentCreate>,
) -> impl Responder {
    let result = sqlx::query(
        "INSERT INTO contents (ref_id, short_desc, long_desc, image_path, title)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(content_data.ref_id)
    .bind(&content_data.short_desc)
    .bind(&content_data.long_desc)
    .bind(&content_data.image_path)
    .bind(&content_data.title)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(result) => {
            let content_id = result.last_insert_rowid();
            HttpResponse::Created().json(serde_json::json!({
                "id": content_id,
                "message": "Content created successfully"
            }))
        }
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to create content"
        })),
    }
}

pub async fn get_contents(pool: web::Data<SqlitePool>) -> impl Responder {
    let contents = sqlx::query_as::<_, Content>("SELECT * FROM contents ORDER BY id DESC")
        .fetch_all(pool.get_ref())
        .await;

    match contents {
        Ok(contents) => HttpResponse::Ok().json(contents),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch contents"
        })),
    }
}

pub async fn get_content(
    pool: web::Data<SqlitePool>,
    content_id: web::Path<i64>,
) -> impl Responder {
    let content = sqlx::query_as::<_, Content>("SELECT * FROM contents WHERE id = ?")
        .bind(*content_id)
        .fetch_optional(pool.get_ref())
        .await;

    match content {
        Ok(Some(content)) => HttpResponse::Ok().json(content),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Content not found"
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        })),
    }
}

pub async fn get_contents_by_ref(
    pool: web::Data<SqlitePool>,
    ref_id: web::Path<i64>,
) -> impl Responder {
    let contents =
        sqlx::query_as::<_, Content>("SELECT * FROM contents WHERE ref_id = ? ORDER BY id DESC")
            .bind(*ref_id)
            .fetch_all(pool.get_ref())
            .await;

    match contents {
        Ok(contents) => HttpResponse::Ok().json(contents),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch contents"
        })),
    }
}

pub async fn update_content(
    pool: web::Data<SqlitePool>,
    content_id: web::Path<i64>,
    content_data: web::Json<ContentUpdate>,
    config: web::Data<AppConfig>,
) -> impl Responder {
    let upload_dir = &config.upload_dir;
    
    let existing = match sqlx::query_as::<_, Content>("SELECT * FROM contents WHERE id = ?")
        .bind(*content_id)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(content)) => content,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({"error": "Content not found"}))
        }
        Err(_) => {
            return HttpResponse::InternalServerError()
                .json(serde_json::json!({"error": "Database error"}))
        }
    };

    let ref_id = content_data.ref_id.unwrap_or(existing.ref_id);
    let short_desc = content_data
        .short_desc
        .as_ref()
        .or(existing.short_desc.as_ref());
    let long_desc = content_data
        .long_desc
        .as_ref()
        .or(existing.long_desc.as_ref());
    let image_path = content_data
        .image_path
        .as_ref()
        .or(existing.image_path.as_ref());
    let title = content_data.title.as_ref().or(existing.title.as_ref());

    let result = sqlx::query(
        "UPDATE contents SET ref_id = ?, short_desc = ?, long_desc = ?, image_path = ?, 
         title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .bind(ref_id)
    .bind(short_desc)
    .bind(long_desc)
    .bind(image_path)
    .bind(title)
    .bind(*content_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => {
            if let Some(new_path) = &content_data.image_path {
                if let Some(old_path) = &existing.image_path {
                    if old_path != new_path {
                        let full_old_path = Path::new(&**upload_dir).join(old_path);
                        let _ = std::fs::remove_file(full_old_path);
                    }
                }
            }
            HttpResponse::Ok().json(serde_json::json!({"message": "Content updated successfully"}))
        }
        Err(_) => HttpResponse::InternalServerError()
            .json(serde_json::json!({"error": "Failed to update database"})),
    }
}

pub async fn delete_content(
    pool: web::Data<SqlitePool>,
    content_id: web::Path<i64>,
    config: web::Data<AppConfig>,
) -> impl Responder {
    let upload_dir = &config.upload_dir;

    let content = match sqlx::query_as::<_, Content>("SELECT * FROM contents WHERE id = ?")
        .bind(*content_id)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(c)) => c,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({"error": "Not found"}))
        }
        Err(_) => {
            return HttpResponse::InternalServerError()
                .json(serde_json::json!({"error": "DB error"}))
        }
    };

    match sqlx::query("DELETE FROM contents WHERE id = ?")
        .bind(*content_id)
        .execute(pool.get_ref())
        .await
    {
        Ok(_) => {
            if let Some(path) = content.image_path {
                let full_path = Path::new(&**upload_dir).join(path);
                let _ = std::fs::remove_file(full_path);
            }
            HttpResponse::Ok().json(serde_json::json!({"message": "Deleted successfully"}))
        }
        Err(_) => {
            HttpResponse::InternalServerError().json(serde_json::json!({"error": "Delete failed"}))
        }
    }
}
