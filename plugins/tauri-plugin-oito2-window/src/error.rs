// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use serde::Serialize;

/// Errors returned by the plugin's Rust API and commands.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    /// An error reported by Tauri.
    #[error(transparent)]
    Tauri(#[from] tauri::Error),
    /// The requested operation is not supported on this platform.
    #[error("unsupported: {0}")]
    Unsupported(String),
    /// A command received an argument outside its valid range.
    #[error("invalid input: {0}")]
    InvalidInput(String),
}

#[derive(Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
enum ErrorKind {
    Tauri(String),
    Unsupported(String),
    InvalidInput(String),
}

impl Serialize for Error {
    fn serialize<S: serde::Serializer>(
        &self,
        serializer: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        let message = self.to_string();
        let kind = match self {
            Self::Tauri(_) => ErrorKind::Tauri(message),
            Self::Unsupported(_) => ErrorKind::Unsupported(message),
            Self::InvalidInput(_) => ErrorKind::InvalidInput(message),
        };
        kind.serialize(serializer)
    }
}

/// Result type of the plugin.
pub type Result<T> = std::result::Result<T, Error>;
