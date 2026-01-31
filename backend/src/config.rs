#[derive(Clone)]
pub struct AppConfig {
    pub jwt_secret: String,
    pub jwt_expiration: i64,
    pub upload_dir: String,
}
