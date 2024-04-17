use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Device {
    pub id: u32,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub device_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub number: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub universe: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mute: Option<bool>,
    pub attributes: DeviceAttributes,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Channel {
    pub channel_type: String,
    pub dmx_channel: u16,
    pub slider_value: u8,
    pub backup_value: u8,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DeviceAttributes {
    pub channels: Vec<Channel>,
}