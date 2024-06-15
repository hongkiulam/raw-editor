use image::DynamicImage;
use rawler::decoders::RawMetadata;
use std::collections::HashSet;
use wasm_bindgen::prelude::*;

use crate::decode;
use crate::operation_type::OperationType;

const RGB_MAX_8BIT: u8 = 255;
const RGB_MAX_16BIT: u16 = 65535;

// ℹ️ Since this is a struct which is directly exposed to JS (as a return value), we need to ensure that any
// public fields are serializable to JS.
// As seen below, we are able to store complex types like DynamicImage and RawMetadata, as long as they are not
// directly interfaced with JS. (return types, function arguments, etc.)
#[wasm_bindgen]
pub struct ImageProcessor {
    image_width: u32,
    image_height: u32,
    metadata: RawMetadata,
    image: DynamicImage,
    // Stores the operations to be applied to the image
    // Each operation is a tuple of the operation type and the operation function
    // Storing the operation type allows us to ensure that an operation is only applied once (see apply_operations method)
    operations: Vec<(OperationType, Box<dyn Fn(&mut DynamicImage)>)>,
}

#[wasm_bindgen]
impl ImageProcessor {
    // #[wasm_bindgen(constructor)] - this allows us to expose this function to JS as a constructor i.e. `new ImageProcessor(imageData)`
    #[wasm_bindgen(constructor)]
    pub fn new(image_data: &[u8]) -> ImageProcessor {
        let decoded_image = decode::decode_raw_image(image_data).unwrap_throw();
        let (metadata, dynamic_image) = decoded_image;

        ImageProcessor {
            image_width: dynamic_image.width(),
            image_height: dynamic_image.height(),
            metadata,
            image: dynamic_image,
            operations: Vec::new(),
        }
    }

    // #[wasm_bindgen(getter)] - this allows us to expose this function to JS as a getter i.e. `myRawImage.width` 👍 `myRawImage.width()` 🙅
    #[wasm_bindgen(getter)]
    pub fn width(&self) -> u32 {
        self.image_width
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> u32 {
        self.image_height
    }

    #[wasm_bindgen(getter)]
    pub fn metadata(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.metadata)?)
    }

    pub fn apply_operations(&mut self) -> Vec<u8> {
        // create a HashSet to store the operation types that have been applied
        // this allows us to ensure that an operation is only applied once, by ignoring operations with the same type
        let mut applied_operations = HashSet::new();
        let mut image = self.image.clone();

        // iterate over the operations in reverse order (most recent operation first)
        for (operation_type, operation) in self.operations.iter().rev() {
            if !applied_operations.contains(operation_type) {
                operation(&mut image);
                applied_operations.insert(operation_type);
            }
        }

        image.into_rgba8().to_vec()
    }

    // TODO: something like this, but we also need to include the values
    // TODO: this should potentially be offloaded to another module
    // pub fn get_operations(&self) -> Result<JsValue, JsValue> {
    //     let operation_types: Vec<String> = self
    //         .operations
    //         .iter()
    //         .map(|(operation_type, _)| match operation_type {
    //             OperationType::Exposure => "Exposure".to_string(),
    //             OperationType::WhiteBalance => "WhiteBalance".to_string(),
    //             // Add other operation types here...
    //         })
    //         .collect();

    //     Ok(serde_wasm_bindgen::to_value(&operation_types)?)
    // }

    pub fn set_exposure(&mut self, value: f32) {
        self.operations.push((
            OperationType::Exposure,
            Box::new(move |image: &mut DynamicImage| {
                image
                    .as_mut_rgb16()
                    .unwrap()
                    .pixels_mut()
                    .for_each(|pixel| {
                        pixel[0] = (pixel[0] as f32 * (1.0 + value))
                            .clamp(0.0, RGB_MAX_16BIT as f32)
                            as u16;
                        pixel[1] = (pixel[1] as f32 * (1.0 + value))
                            .clamp(0.0, RGB_MAX_16BIT as f32)
                            as u16;
                        pixel[2] = (pixel[2] as f32 * (1.0 + value))
                            .clamp(0.0, RGB_MAX_16BIT as f32)
                            as u16;
                    });
            }),
        ));
    }

    // pub fn add_rotation(&mut self, angle: f32) {
    //     self.operations
    //         .push(Box::new(move |image: &mut DynamicImage| {
    //             let new_image = image.rotate(angle); // Assuming rotate method is available in rawler
    //             *image = new_image;
    //         }));
    // }

    // pub fn add_white_balance(&mut self, value: f32) {
    //     self.operations
    //         .push(Box::new(move |image: &mut DynamicImage| {
    //             image.pixels_mut().par_iter_mut().for_each(|pixel| {
    //                 pixel.r = (pixel.r as f32 * value).clamp(0.0, 255.0) as u8;
    //                 pixel.g = (pixel.g as f32 * value).clamp(0.0, 255.0) as u8;
    //                 pixel.b = (pixel.b as f32 * value).clamp(0.0, 255.0) as u8;
    //             });
    //         }));
    // }

    pub fn process(&mut self) -> Vec<u8> {
        self.apply_operations()
    }
}
