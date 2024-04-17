use axum::{
    //extract::Extension,
    routing::get,
    Json, //Router,
};
use tracing::info;
use socketioxide::{extract::SocketRef, SocketIo};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing_subscriber::FmtSubscriber;
//use sqlx::sqlite::SqlitePool;
use serde::Serialize;

mod models;

async fn on_connect(socket: SocketRef) {
    info!("Client connected: {}", socket.id);
}

// Define a struct for your JSON response
#[derive(Serialize)]
struct ApiResponse {
    message: String,
    status: u16,
}

// Your handler function
async fn json_response() -> Json<ApiResponse> {
    Json(ApiResponse {
        message: "This is a JSON response".to_string(),
        status: 200,
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();

    io.ns("/", on_connect);

    let app = axum::Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/json", get(json_response))
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(layer)
        );

    info!("Starting server");

    axum::Server::bind(&"127.0.0.1:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await?;

    Ok(())
}