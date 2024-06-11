use image::DynamicImage;
use log;
use rawler::buffer::Buffer;
use rawler::imgop::develop::RawDevelop;
use rawler::{
    decoders::{RawDecodeParams, RawMetadata},
    get_decoder, RawFile,
};
use wasm_bindgen::prelude::*;

// TODO: rename to accurate describe that this decodes, and instantiates a MyRawImage. But also in the future will process existing edits.
// TODO: figure out if we can make this more performant, and enable reprocessing per edit
// TODO: make this a promise/ future, and use the crate for binding those together
pub fn decode_raw_image(data: &[u8]) -> Result<(RawMetadata, DynamicImage), JsValue> {
    let buf = Buffer::from(data.to_vec());
    let mut rawfile = RawFile::from(buf);
    log::info!("Got raw file");

    let decoder_params = RawDecodeParams { image_index: 0 };

    if let Ok(decoder) = get_decoder(&mut rawfile) {
        log::info!("Successfully got decoder for rawfile");

        let metadata = decoder
            .raw_metadata(&mut rawfile, decoder_params.clone())
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        log::info!("Decoded metadata");
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

        return Ok((metadata.clone(), dynamic_image.clone()));
    } else {
        return Err(JsValue::from_str("Could not get decoder for rawfile"));
    }
}
