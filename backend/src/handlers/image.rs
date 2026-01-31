use actix_multipart::Multipart;
use actix_web::{web, HttpResponse, Responder};
use futures_util::stream::StreamExt as _;
use std::io::Write;
use std::path::Path;
use uuid::Uuid;

use crate::config::AppConfig;

pub async fn upload_image(mut payload: Multipart, config: web::Data<AppConfig>) -> impl Responder {
    let upload_path = Path::new(&config.upload_dir);

    if !upload_path.exists() {
        if let Err(_) = std::fs::create_dir_all(upload_path) {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to create upload directory"
            }));
        }
    }

    while let Some(item) = payload.next().await {
        let mut field = match item {
            Ok(field) => field,
            Err(_) => {
                return HttpResponse::BadRequest().json(serde_json::json!({
                    "error": "Failed to read field"
                }))
            }
        };

        let content_disposition = field.content_disposition();
        let original_filename = content_disposition.get_filename().unwrap_or("unnamed");

        let extension = Path::new(original_filename)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("jpg");

        let filename = format!(
            "{}_{}.{}",
            Uuid::new_v4(),
            chrono::Utc::now().timestamp(),
            extension
        );

        let sanitized_filename = sanitize_filename::sanitize(&filename);
        let filepath = upload_path.join(&sanitized_filename);

        let mut file = match std::fs::File::create(&filepath) {
            Ok(file) => file,
            Err(_) => {
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to create file"
                }))
            }
        };

        while let Some(chunk) = field.next().await {
            let data = match chunk {
                Ok(data) => data,
                Err(_) => {
                    let _ = std::fs::remove_file(&filepath);
                    return HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to read chunk"
                    }));
                }
            };

            if let Err(_) = file.write_all(&data) {
                let _ = std::fs::remove_file(&filepath);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to write file"
                }));
            }
        }

        return HttpResponse::Ok().json(serde_json::json!({
            "filename": sanitized_filename,
            "path": format!("/images/{}", sanitized_filename),
            "message": "Image uploaded successfully"
        }));
    }

    HttpResponse::BadRequest().json(serde_json::json!({
        "error": "No file uploaded"
    }))
}

pub async fn delete_image(
    filename: web::Path<String>,
    config: web::Data<AppConfig>,
) -> impl Responder {
    let filepath = Path::new(&config.upload_dir).join(&*filename);

    if !filepath.exists() {
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Image not found"
        }));
    }

    match std::fs::remove_file(&filepath) {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Image deleted successfully"
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to delete image"
        })),
    }
}

pub async fn get_image(
    filename: web::Path<String>,
    config: web::Data<AppConfig>,
) -> impl Responder {
    let filepath = Path::new(&config.upload_dir).join(&*filename);

    if !filepath.exists() {
        return HttpResponse::NotFound().json(serde_json::json!({
            "error": "Image not found"
        }));
    }

    match std::fs::read(&filepath) {
        Ok(content) => {
            let content_type = match filepath.extension().and_then(|ext| ext.to_str()) {
                Some("jpg") | Some("jpeg") => "image/jpeg",
                Some("png") => "image/png",
                Some("gif") => "image/gif",
                Some("webp") => "image/webp",
                _ => "application/octet-stream",
            };

            HttpResponse::Ok().content_type(content_type).body(content)
        }
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to read image"
        })),
    }
}
