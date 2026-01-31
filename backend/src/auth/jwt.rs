use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub agent_id: i64,
    pub exp: i64,
    pub iat: i64,
}

pub fn generate_token(
    agent_id: i64,
    agent_number: String,
    secret: &str,
    expires_in_seconds: i64,
) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let expiration_time = now + Duration::seconds(expires_in_seconds);

    let claims = Claims {
        sub: agent_number,
        agent_id,
        exp: expiration_time.timestamp(),
        iat: now.timestamp(),
    };

    encode(
        &Header::default(), // HS256
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn decode_token(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    println!("decode_token() called");
    println!("Token: {}", token);
    println!("Secret length: {}", secret.len());

    let validation = Validation::default(); // validates exp + iat

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )?;

    println!("Claims: {:?}", token_data.claims);

    Ok(token_data.claims)
}
