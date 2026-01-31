mod auth;
mod db;
mod handlers;
mod models;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use dotenv::dotenv;
use std::env;

use auth::middleware::AuthMiddleware;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let jwt_expiration: i64 = env::var("JWT_EXPIRATION")
        .unwrap_or_else(|_| "86400".to_string())
        .parse()
        .expect("JWT_EXPIRATION must be a number");
    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let server_port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("SERVER_PORT must be a number");
    let upload_dir = env::var("UPLOAD_DIR").unwrap_or_else(|_| "../data/images".to_string());

    println!("Initializing database...");
    let pool = db::init_db().await.expect("Failed to initialize database");

    println!("Starting server at {}:{}", server_host, server_port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(jwt_secret.clone()))
            .app_data(web::Data::new(jwt_expiration))
            .app_data(web::Data::new(upload_dir.clone()))
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/auth")
                            .route("/login", web::post().to(handlers::auth::login))
                            .route("/register", web::post().to(handlers::auth::register))
                    )
                    .service(
                        web::scope("/agents")
                            .wrap(AuthMiddleware {
                                jwt_secret: jwt_secret.clone(),
                            })
                            .route("", web::get().to(handlers::agent::get_agents))
                            .route("/me", web::get().to(handlers::agent::get_current_agent))
                            .route("/{id}", web::get().to(handlers::agent::get_agent))
                            .route("/{id}", web::put().to(handlers::agent::update_agent_status))
                            .route("/{id}", web::delete().to(handlers::agent::delete_agent))
                    )
                    .service(
                        web::scope("/pages")
                            .wrap(AuthMiddleware {
                                jwt_secret: jwt_secret.clone(),
                            })
                            .route("", web::post().to(handlers::page::create_page))
                            .route("", web::get().to(handlers::page::get_pages))
                            .route("/{id}", web::get().to(handlers::page::get_page))
                            .route("/{id}", web::put().to(handlers::page::update_page))
                            .route("/{id}", web::delete().to(handlers::page::delete_page))
                    )
                    .service(
                        web::scope("/contents")
                            .wrap(AuthMiddleware {
                                jwt_secret: jwt_secret.clone(),
                            })
                            .route("", web::post().to(handlers::content::create_content))
                            .route("", web::get().to(handlers::content::get_contents))
                            .route("/{id}", web::get().to(handlers::content::get_content))
                            .route("/{id}", web::put().to(handlers::content::update_content))
                            .route("/{id}", web::delete().to(handlers::content::delete_content))
                            .route("/ref/{ref_id}", web::get().to(handlers::content::get_contents_by_ref))
                    )
                    .service(
                        web::scope("/images")
                            .wrap(AuthMiddleware {
                                jwt_secret: jwt_secret.clone(),
                            })
                            .route("/upload", web::post().to(handlers::image::upload_image))
                            .route("/{filename}", web::delete().to(handlers::image::delete_image))
                    )
                    .service(
                        web::scope("/search")
                            .wrap(AuthMiddleware {
                                jwt_secret: jwt_secret.clone(),
                            })
                            .route("", web::get().to(handlers::search::search_all))
                            .route("/pages", web::get().to(handlers::search::search_pages))
                            .route("/contents", web::get().to(handlers::search::search_contents))
                    )
                    .route("/images/{filename}", web::get().to(handlers::image::get_image))
            )
    })
    .bind((server_host, server_port))?
    .run()
    .await
}
