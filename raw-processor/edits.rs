use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Serialize)]
pub struct Edits {
    exposure: f32,
}

#[wasm_bindgen]
impl Edits {
    pub fn default() -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&Edits { exposure: 0.0 })
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    #[wasm_bindgen(constructor)]
    pub fn new() -> Edits {
        Edits { exposure: 0.0 }
    }

    #[wasm_bindgen(getter)]
    pub fn exposure(&self) -> f32 {
        self.exposure
    }
    #[wasm_bindgen(setter)]
    pub fn set_exposure(&mut self, value: f32) {
        self.exposure = value
    }

    pub fn do_clone(&self) -> Edits {
        self.clone()
    }
}
