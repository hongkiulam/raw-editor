// mod demosaic;
use image::{self, DynamicImage, GenericImageView};
// use imagepipe::{self, ImageSource};
// use rawloader::{Orientation, RawImageData, CFA};
use rawler::{RawImage, RawlerError};
use std::convert::TryInto;
// use std::io::Cursor;
use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use std::panic;
// use anyhow::anyhow;
// use image::{DynamicImage, ImageBuffer};
// use image::{Pixel, Rgb};
use log;
use rawler::buffer::Buffer;
use rawler::imgop::develop::RawDevelop;
use rawler::{
    decoders::{RawDecodeParams, RawMetadata},
    get_decoder, RawFile,
};

// TODO, publish rawler fork, fix the time usage, maybe replace with wasm-timer
/**
 * #[cfg(not(target_arch = "wasm32"))]
use std::time::{SystemTime, UNIX_EPOCH};
#[cfg(target_arch = "wasm32")]
use wasmtimer::std::{SystemTime, UNIX_EPOCH};
 */

// TODO: cleanup the code, and possible rename
// Struct to hold the image data and dimensions
#[wasm_bindgen]
pub struct MyRawImage {
    // This is safe, because it is stored purely in rust memory. We will not have compilation issues
    // as long as it is not exposed to the JS side via `pub`
    // i.e. dont do this 👉 pub fn new(img: DynamicImage), pub fn image(&self) -> DynamicImage
    dynamic_image: DynamicImage,
    metadata: RawMetadata,
    // width: u32,
    // height: u32,
    // image: Vec<u8>,
}

#[wasm_bindgen]
impl MyRawImage {
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

    // fn dynamic_image(&self) -> DynamicImage {
    //     self.dynamic_image.clone()
    // }

    // fn dynamic_image(&self) -> DynamicImage {
    //     image_serializer::deserialize_image(self.image.clone())
    //     // let buffer = image::ImageBuffer::from_vec(self.width, self.height, self.image.clone()).unwrap();

    //     // image::DynamicImage::new(self.width,self.height, buffer)
    //     // image::DynamicImage::ImageRgb32F(
    //     //     image::Rgb32FImage::from_vec(self.width, self.height, self.image.clone()).unwrap(),
    //     // )
    // }

    // #[wasm_bindgen(getter)]
    // pub fn orientation(&self) -> String {
    //     self.orientation as String
    // }

    // Getter for the image_u16 property
    /**
     * The issue is that wasm-bindgen cannot automatically expose a Vec<u16> property, so we need to manually implement a getter for it.
     */
    #[wasm_bindgen(getter)]
    pub fn image_as_rgba8(&self) -> Vec<u8> {
        // log::info!("getting image as rgba8");
        // log::info!("{}",self.dynamic_image.clone().width().to_string());
        let img = self.dynamic_image.clone();
        log::info!("image_as_rgba8");
        log::info!("{}", img.get_pixel(0, 0)[0]);
        log::info!("{:?}", img.color());
        img.into_rgba8().to_vec()
    }

    #[wasm_bindgen]
    pub fn rotate_image(&mut self) {
        // let mut img = image::DynamicImage::ImageRgba8(image::RgbaImage::from_vec(self.width, self.height, self.image.clone()).unwrap());
        let img = self.dynamic_image.rotate90();

        // self.width = img.width();
        // self.height = img.height();
        self.dynamic_image = img;
        // self.image = image_serializer::serialize_image(&img);
    }

    pub fn increase_exposure(&mut self) {
        let img = self.dynamic_image.brighten(1000);
        log::info!("increased exposure");
        log::info!("{}", img.get_pixel(0, 0)[0]);
        self.dynamic_image = img.clone()
        // self.image = image_serializer::serialize_image(&img)
    }

    // Getter for the data property
    // /**
    //  * The issue is that wasm-bindgen cannot automatically expose a Vec<u8> property, so we need to manually implement a getter for it.
    //  *
    //  * @example
    //  * error[E0277]: the trait bound `Vec<u8>: std::marker::Copy` is not satisfied
    //  *   --> rust-raw/lib.rs:11:21
    //  *     |
    //  *  11 |     pub data: Vec<u8>,
    //  *     |                     ^ the trait `std::marker::Copy` is not implemented for `Vec<u8>`
    //  */
    // #[wasm_bindgen(getter)]
    // pub fn data(&self) -> Vec<u8> {
    //     self.data.clone()
    // }
}

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

        let rawimage = decoder
            .raw_image(&mut rawfile, decoder_params, false)
            // the ? operator at the end is used by Rust to propagate errors up the call stack
            // however, the error from .raw_image (RawlerError) is not compatible with JsValue (the return type of this function)
            // so we need to convert it to a string first
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        log::info!("decoded image");

        let dev = RawDevelop::default();
        log::info!("got rawimage developer");

        let developed_img = dev.develop_intermediate(&rawimage).unwrap();
        log::info!("got developed image");

        let mut img = developed_img.to_dynamic_image().unwrap();
        // spits out a srg gamma 2.4 image
        log::info!("got dynamic image");

        img = match metadata.exif.orientation.unwrap() {
            5 | 6 => img.rotate90(),
            7 | 8 => img.rotate270(),
            _ => img,
        };

        log::info!("rotated image");

        //   return Ok(img);
        return Ok(MyRawImage {
            // width: img.width(),
            // height: img.height(),
            // image: image_serializer::serialize_image(&img),
            dynamic_image: img,
            metadata,
        });
    } else {
        // error!("Error reading image data");
        return Err(JsValue::from_str("Could not get decoder for rawfile"));
    }
}

/**
Function for simply validating that the wasm module is working
*/
#[wasm_bindgen]
pub fn ping() -> String {
    "pong".to_string()
}

/**
 * Function which binds rust logs to the console
 * Should be called immediately after wasm.init
 */
#[wasm_bindgen]
pub fn bind_loggers() {
    // usage of log crate will surface in browser console
    wasm_logger::init(wasm_logger::Config::default());
    // This will cause the panic message to be printed to the console
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    // verify it works
    log::info!("Logger bound");
}
