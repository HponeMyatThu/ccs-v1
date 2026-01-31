use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Agent {
    pub id: i64,
    pub agent_number: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct AgentLogin {
    pub agent_number: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct AgentCreate {
    pub agent_number: String,
    pub password: String,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub agent: AgentInfo,
}

#[derive(Debug, Serialize)]
pub struct AgentInfo {
    pub id: i64,
    pub agent_number: String,
    pub is_active: bool,
}
