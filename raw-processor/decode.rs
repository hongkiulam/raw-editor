use image::DynamicImage;
use log;
use rawler::buffer::Buffer;
use rawler::imgop::develop::RawDevelop;
use rawler::{
    decoders::{RawDecodeParams, RawMetadata},
    get_decoder, RawFile,
};
use wasm_bindgen::prelude::*;

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
        log::info!("got rawimage developer2");
        // TODO: here is where we get the error 'unreachable'. not sure why the panic hook is not picking it up, but it is being thrown from within
        // the rawler crate. From expand_bayer_rgb -> out.pixels_mut().par_chunks_exact_mut()
        let developed_img = dev.develop_intermediate(&rawimage).unwrap_throw();
        // log::info!("got rawimage developer3");
        // match developed_img_result {
        //     Ok(_) => log::info!("developed image"),
        //     Err(ref e) => log::info!("Error developing image: {:?}", e),
        // }
        // // if developed_img is error, return error
        // let developed_img = developed_img_result.unwrap();
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
