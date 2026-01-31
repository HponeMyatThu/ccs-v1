use actix_web::{web, HttpResponse, Responder};
use bcrypt::{hash, verify, DEFAULT_COST};
use sqlx::SqlitePool;

use crate::auth::jwt::generate_token;
use crate::models::{Agent, AgentLogin, AgentCreate, AuthResponse, AgentInfo};

pub async fn login(
    pool: web::Data<SqlitePool>,
    credentials: web::Json<AgentLogin>,
    jwt_secret: web::Data<String>,
    jwt_expiration: web::Data<i64>,
) -> impl Responder {
    let agent = sqlx::query_as::<_, Agent>(
        "SELECT * FROM agents WHERE agent_number = ? AND is_active = 1"
    )
    .bind(&credentials.agent_number)
    .fetch_optional(pool.get_ref())
    .await;

    match agent {
        Ok(Some(agent)) => {
            if verify(&credentials.password, &agent.password_hash).unwrap_or(false) {
                match generate_token(agent.id, agent.agent_number.clone(), &jwt_secret, **jwt_expiration) {
                    Ok(token) => {
                        let response = AuthResponse {
                            token,
                            agent: AgentInfo {
                                id: agent.id,
                                agent_number: agent.agent_number,
                                is_active: agent.is_active,
                            },
                        };
                        HttpResponse::Ok().json(response)
                    }
                    Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
                        "error": "Failed to generate token"
                    })),
                }
            } else {
                HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Invalid credentials"
                }))
            }
        }
        Ok(None) => HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid credentials"
        })),
        Err(_) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": "Database error"
        })),
    }
}

pub async fn register(
    pool: web::Data<SqlitePool>,
    agent_data: web::Json<AgentCreate>,
) -> impl Responder {
    let password_hash = match hash(&agent_data.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to hash password"
            }))
        }
    };

    let is_active = agent_data.is_active.unwrap_or(true);

    let result = sqlx::query(
        "INSERT INTO agents (agent_number, password_hash, is_active) VALUES (?, ?, ?)"
    )
    .bind(&agent_data.agent_number)
    .bind(&password_hash)
    .bind(is_active)
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(result) => {
            let agent_id = result.last_insert_rowid();
            HttpResponse::Created().json(serde_json::json!({
                "id": agent_id,
                "agent_number": agent_data.agent_number,
                "is_active": is_active
            }))
        }
        Err(e) => {
            if e.to_string().contains("UNIQUE constraint failed") {
                HttpResponse::Conflict().json(serde_json::json!({
                    "error": "Agent number already exists"
                }))
            } else {
                HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Database error"
                }))
            }
        }
    }
}
