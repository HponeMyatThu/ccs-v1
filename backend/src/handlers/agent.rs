use actix_web::{web, HttpResponse, HttpRequest, Responder};
use sqlx::SqlitePool;

use crate::auth::Claims;
use crate::models::Agent;

use actix_web::HttpMessage;

pub async fn get_agents(pool: web::Data<SqlitePool>) -> impl Responder {
    let agents = sqlx::query_as::<_, Agent>("SELECT * FROM agents ORDER BY id DESC")
        .fetch_all(pool.get_ref())
        .await;

    match agents {
        Ok(agents) => HttpResponse::Ok().json(agents),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Failed to fetch agents"
        })),
    }
}

pub async fn get_agent(
    pool: web::Data<SqlitePool>,
    agent_id: web::Path<i64>,
) -> impl Responder {
    let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
        .bind(*agent_id)
        .fetch_optional(pool.get_ref())
        .await;

    match agent {
        Ok(Some(agent)) => HttpResponse::Ok().json(agent),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Agent not found"
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        })),
    }
}

pub async fn update_agent_status(
    pool: web::Data<SqlitePool>,
    agent_id: web::Path<i64>,
    body: web::Json<serde_json::Value>,
) -> impl Responder {
    let is_active = body.get("is_active").and_then(|v| v.as_bool());

    if is_active.is_none() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "is_active field is required"
        }));
    }

    let result = sqlx::query(
        "UPDATE agents SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(is_active.unwrap())
    .bind(*agent_id)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                HttpResponse::Ok().json(serde_json::json!({
                    "message": "Agent status updated"
                }))
            } else {
                HttpResponse::NotFound().json(serde_json::json!({
                    "error": "Agent not found"
                }))
            }
        }
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        })),
    }
}

pub async fn delete_agent(
    pool: web::Data<SqlitePool>,
    agent_id: web::Path<i64>,
) -> impl Responder {
    let result = sqlx::query("DELETE FROM agents WHERE id = ?")
        .bind(*agent_id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(result) => {
            if result.rows_affected() > 0 {
                HttpResponse::Ok().json(serde_json::json!({
                    "message": "Agent deleted"
                }))
            } else {
                HttpResponse::NotFound().json(serde_json::json!({
                    "error": "Agent not found"
                }))
            }
        }
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        })),
    }
}

pub async fn get_current_agent(req: HttpRequest, pool: web::Data<SqlitePool>) -> impl Responder {
    let claims = req.extensions().get::<Claims>().cloned();

    if let Some(claims) = claims {
        let agent = sqlx::query_as::<_, Agent>("SELECT * FROM agents WHERE id = ?")
            .bind(claims.agent_id)
            .fetch_optional(pool.get_ref())
            .await;

        match agent {
            Ok(Some(agent)) => HttpResponse::Ok().json(agent),
            Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
                "error": "Agent not found"
            })),
            Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Database error"
            })),
        }
    } else {
        HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Unauthorized"
        }))
    }
}
