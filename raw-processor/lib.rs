// declare modules
mod decode;
mod dispatch_event_to_js;
mod operation_type;
// declare the image_processor file as a module, but also re-export it directly
pub mod image_processor;
// import wasm_bindgen and make globally available all its functions and types (prelude https://doc.rust-lang.org/reference/names/preludes.html)
use wasm_bindgen::prelude::*;
extern crate console_error_panic_hook;
use log;
use std::panic;

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
