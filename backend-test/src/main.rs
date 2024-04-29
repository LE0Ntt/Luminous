use axum::routing::get;
use tracing::info;
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo
};
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing_subscriber::FmtSubscriber;
use tracing::error;

mod models;

async fn on_connect(socket: SocketRef) {
    info!("Client connected: {}", socket.id);

    socket.on("fader_value", |socket: SocketRef, Data::<FaderValueIn>(data)|{
        info!("Received message: {:?}", data);

        let response = FaderValueOut {
            device_id: data.device_id + 1,
            channel_id: data.channel_id,
            value: data.value,
        };

        info!("Sending message to client: {:?}", response);
        if let Err(e) = socket.broadcast().emit("variable_update", &response) {
            error!("Failed to send message: {:?}", e);
        } else {
            info!("Message sent successfully");
        }
    });
}

#[derive(Debug, serde::Deserialize)]
struct FaderValueIn {
    device_id: u32,
    channel_id: u32,
    value: u8,
}

#[derive(Debug, serde::Serialize)]
struct FaderValueOut {
    device_id: u32,
    channel_id: u32,
    value: u8,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    let (layer, io) = SocketIo::new_layer();

    io.ns("/socket", on_connect);

    let app = axum::Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .route("/fader", get(models::get_devices))
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
