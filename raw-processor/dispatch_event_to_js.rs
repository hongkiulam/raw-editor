use wasm_bindgen::prelude::*;
extern crate web_sys;

// This function allows us to dispatch events from rust
pub fn dispatch_custom_event(type_: &str) {
    let window = web_sys::window().expect("should have a window in this context");

    let event = web_sys::Event::new(type_).unwrap();
    let _ = window.dispatch_event(&event);
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = self)]
    fn dispatchEvent(msg: web_sys::Event);
}

pub fn dispatch_event_to_worker(event_name: &str) {
    dispatchEvent(web_sys::Event::new(&event_name).unwrap())
}
