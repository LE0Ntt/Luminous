use serde::{Serialize, Deserialize};
use axum::Json;

#[derive(Serialize, Deserialize)]
pub struct Device {
    pub id: u32,
    pub name: String,
    #[serde(rename = "device_type", skip_serializing_if = "Option::is_none")]
    pub device_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub number: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub universe: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mute: Option<bool>,
    pub attributes: DeviceAttributes,
}

#[derive(Serialize, Deserialize)]
pub struct DeviceAttributes {
    #[serde(rename = "channel")]
    pub channels: Vec<Channel>,
}

#[derive(Serialize, Deserialize)]
pub struct Channel {
    pub id: String,
    #[serde(rename = "dmx_channel", skip_serializing_if = "Option::is_none")]
    pub dmx_channel: Option<String>,
    #[serde(rename = "channel_type")]
    pub channel_type: String,
    #[serde(rename = "sliderValue")]
    pub slider_value: u8,
    #[serde(rename = "backupValue", skip_serializing_if = "Option::is_none")]
    pub backup_value: Option<u8>,
}

#[derive(Serialize, Deserialize)]
pub struct Devices {
    pub devices: Vec<Device>,
}

pub async fn get_devices() -> Json<Devices> {
  Json(Devices {
      devices: vec![
          Device {
              id: 0,
              name: "Master".to_string(),
              device_type: None,
              number: None,
              universe: None,
              mute: None,
              attributes: DeviceAttributes {
                  channels: vec![
                      Channel {
                          id: "0".to_string(),
                          dmx_channel: None,
                          channel_type: "main".to_string(),
                          slider_value: 255,
                          backup_value: None,
                      },
                  ],
              },
          },
          Device {
              id: 1,
              name: "D1".to_string(),
              device_type: Some("Spot".to_string()),
              number: Some(1),
              universe: Some("U1".to_string()),
              mute: Some(false),
              attributes: DeviceAttributes {
                  channels: vec![
                      Channel {
                          id: "0".to_string(),
                          dmx_channel: Some("1".to_string()),
                          channel_type: "main".to_string(),
                          slider_value: 255,
                          backup_value: Some(0),
                      },
                  ],
              },
          },
          Device {
              id: 2,
              name: "D2".to_string(),
              device_type: Some("Spot".to_string()),
              number: Some(2),
              universe: Some("U1".to_string()),
              mute: Some(false),
              attributes: DeviceAttributes {
                  channels: vec![
                      Channel {
                          id: "0".to_string(),
                          dmx_channel: Some("2".to_string()),
                          channel_type: "main".to_string(),
                          slider_value: 255,
                          backup_value: Some(0),
                      },
                  ],
              },
          },
      ],
  })
}
