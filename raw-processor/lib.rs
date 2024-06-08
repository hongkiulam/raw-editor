use image::{self, DynamicImage, GenericImageView};
use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use log;
use rawler::buffer::Buffer;
use rawler::imgop::develop::RawDevelop;
use rawler::{
    decoders::{RawDecodeParams, RawMetadata},
    get_decoder, RawFile,
};
use std::panic;

// TODO rename
// ℹ️ Since this is a struct which is directly exposed to JS (as a return value), we need to ensure that any
// public fields are serializable to JS.
// As seen below, we are able to store complex types like DynamicImage and RawMetadata, as long as they are not
// directly interfaced with JS.
#[wasm_bindgen]
pub struct MyRawImage {
    // This is safe, because it is stored purely in rust memory. We will not have compilation issues
    // as long as it is not exposed to the JS side via `pub`
    // i.e. dont do this 👉 pub fn new(img: DynamicImage), pub fn image(&self) -> DynamicImage
    dynamic_image: DynamicImage,
    metadata: RawMetadata,
}

#[wasm_bindgen]
pub struct Test {
    test: u32,
}
#[wasm_bindgen]
impl Test {
    #[wasm_bindgen(getter)]
    pub fn test(&self) -> u32 {
        self.test
    }
}

#[wasm_bindgen]
impl MyRawImage {
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
        log::info!("image_as_rgba8");
        log::info!("{}", img.get_pixel(0, 0)[0]);
        log::info!("{:?}", img.color());
        img.into_rgba8().to_vec()
    }

    // pub functions are automatically exposed
    pub fn rotate_image(&mut self) {
        let img = self.dynamic_image.rotate90();

        self.dynamic_image = img;
    }

    pub fn increase_exposure(&mut self) {
        let img = self.dynamic_image.brighten(1000);
        log::info!("increased exposure");
        log::info!("{}", img.get_pixel(0, 0)[0]);
        self.dynamic_image = img;
    }

    #[wasm_bindgen(getter)]
    pub fn test(&self) -> Test {
        Test { test: 42 }
    }
}

// TODO: rename to accurate describe that this decodes, and instantiates a MyRawImage. But also in the future will process existing edits.
// TODO: figure out if we can make this more performant, and enable reprocessing per edit
// TODO: make this a promise/ future, and use the crate for binding those together
#[wasm_bindgen]
pub fn decode_raw_image(data: &[u8]) -> Result<MyRawImage, JsValue> {
    let buf = Buffer::from(data.to_vec());
    let mut rawfile = RawFile::from(buf);
    log::info!("got rawfile");

    let decoder_params = RawDecodeParams { image_index: 0 };

    if let Ok(decoder) = get_decoder(&mut rawfile) {
        log::info!("successfully got decoder for rawfile");

        let metadata = decoder
            .raw_metadata(&mut rawfile, decoder_params.clone())
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        log::info!("decoded metadata");
        // 👆 the ? operator at the end is used by Rust to propagate errors up the call stack
        // however, the error from .raw_image (RawlerError) is not compatible with JsValue (the return type of this function)
        // so we need to convert it to a string first

        let rawimage = decoder
            .raw_image(&mut rawfile, decoder_params, false)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        log::info!("decoded image");

        let dev = RawDevelop::default();
        log::info!("got rawimage developer");

        let developed_img = dev.develop_intermediate(&rawimage).unwrap();
        log::info!("got developed image");

        let mut dynamic_image = developed_img.to_dynamic_image().unwrap();
        log::info!("got dynamic image");

        dynamic_image = match metadata.exif.orientation.unwrap() {
            5 | 6 => dynamic_image.rotate90(),
            7 | 8 => dynamic_image.rotate270(),
            _ => dynamic_image,
        };
        log::info!("rotated image");

        return Ok(MyRawImage {
            dynamic_image,
            metadata,
        });
    } else {
        return Err(JsValue::from_str("Could not get decoder for rawfile"));
    }
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
