use edits::Edits;
use image::{self, DynamicImage};
mod decode;
mod editor;
mod edits;
use editor::Editor;
use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use log;
use rawler::buffer::Buffer;
use rawler::imgop::develop::RawDevelop;
use rawler::{
    decoders::{RawDecodeParams, RawMetadata},
    get_decoder,
};
use std::panic;
use web_sys::js_sys::Promise;

// This function allows us to dispatch events from rust
fn dispatch_custom_event(type_: &str) {
    let window = web_sys::window().expect("should have a window in this context");

    let event = web_sys::Event::new(type_).unwrap();
    let _ = window.dispatch_event(&event);
}

// TODO rename
// ℹ️ Since this is a struct which is directly exposed to JS (as a return value), we need to ensure that any
// public fields are serializable to JS.
// As seen below, we are able to store complex types like DynamicImage and RawMetadata, as long as they are not
// directly interfaced with JS.
#[wasm_bindgen]
#[derive(Clone)] // This is required for the ops getter, as we clone the MyRawImage instance into the Operations struct
pub struct RawFile {
    // This is safe, because it is stored purely in rust memory. We will not have compilation issues
    // as long as it is not exposed to the JS side via `pub`
    // i.e. dont do this 👉 pub fn new(img: DynamicImage), pub fn image(&self) -> DynamicImage
    dynamic_image: DynamicImage,
    metadata: RawMetadata,
}

#[wasm_bindgen]
impl RawFile {
    pub fn decode(raw_file_data: &[u8]) -> Result<RawFile, JsValue> {
        let (metadata, dynamic_image) = decode::decode_raw_image(raw_file_data)
            .map_err(|_| JsValue::from_str("Could not decode raw file"))?;

        log::info!("Decoded raw image");
        let raw_file = RawFile {
            dynamic_image,
            metadata,
        };
        log::info!("Created raw file");
        Ok(raw_file)
    }
    // #[wasm_bindgen(getter)] - this allows us to expose this function to JS as a getter i.e. `myRawImage.width` 👍 `myRawImage.width()` 🙅
    #[wasm_bindgen(getter)]
    pub fn width(&self) -> u32 {
        self.dynamic_image.width()
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> u32 {
        self.dynamic_image.height()
    }

    #[wasm_bindgen(getter)]
    pub fn metadata(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.metadata)?)
    }

    #[wasm_bindgen(getter)]
    pub fn image_as_rgba8(&self) -> Vec<u8> {
        let img = self.dynamic_image.clone();
        img.into_rgba8().to_vec()
    }

    #[wasm_bindgen]
    pub fn process_edits(&self, edits: &Edits) -> Promise {
        let cloned_self = self.clone();
        let cloned_edits = edits.clone();
        let future = async move {
            let mut img = cloned_self.dynamic_image.clone();
            let processed_img = Editor {
                edits: cloned_edits,
                dynamic_image: img,
            }
            .process();
            let vec = processed_img.into_rgba8().to_vec();
            let js_value = serde_wasm_bindgen::to_value(&vec)
                .map_err(|e| JsValue::from_str(&e.to_string()))?;
            Ok(js_value)
        };
        wasm_bindgen_futures::future_to_promise(future)
    }

    // pub fn process_edits(&self, edits: &Edits) -> Vec<u8> {
    //     let mut img = self.dynamic_image.clone();
    //     let processed_img = Editor {
    //         edits: edits.clone(),
    //         dynamic_image: img,
    //     }
    //     .process();
    //     processed_img.into_rgba8().to_vec()
    // }
}

/**
* This function is called when the wasm module is loaded in the browser
 */
#[wasm_bindgen(start)]
fn start() {
    // usage of log crate will surface in browser console
    wasm_logger::init(wasm_logger::Config::default());
    // This will cause the panic message to be printed to the console
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    log::info!("WASM module loaded ✅");
    // verify it works
    log::info!("Bound loggers to console");
}
