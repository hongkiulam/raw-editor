use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Serialize)]
pub struct Edits {
    exposure: f32,
    rotation: u16,
}

#[wasm_bindgen]
impl Edits {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Edits {
        Edits {
            exposure: 0.0,
            rotation: 0,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn exposure(&self) -> f32 {
        self.exposure
    }
    #[wasm_bindgen(setter)]
    pub fn set_exposure(&mut self, value: f32) {
        self.exposure = value
    }
    #[wasm_bindgen(getter)]
    pub fn rotation(&self) -> u16 {
        self.rotation
    }
    #[wasm_bindgen(setter)]
    pub fn set_rotation(&mut self, value: u16) {
        self.rotation = value
    }
}
