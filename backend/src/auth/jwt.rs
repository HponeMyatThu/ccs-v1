use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub agent_id: i64,
    pub exp: i64,
    pub iat: i64,
}

pub fn generate_token(agent_id: i64, agent_number: String, secret: &str, expiration: i64) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let expiration_time = now + Duration::seconds(expiration);

    let claims = Claims {
        sub: agent_number,
        agent_id,
        exp: expiration_time.timestamp(),
        iat: now.timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

pub fn decode_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )?;

    Ok(token_data.claims)
}
