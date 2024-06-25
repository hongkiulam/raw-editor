use image::DynamicImage;
use rawler::decoders::RawMetadata;
use std::collections::HashMap;
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
    metadata: RawMetadata,
    original_image: DynamicImage,
    original_width: u32,
    original_height: u32,
    edited_width: u32,
    edited_height: u32,
    // Stores the operations to be applied to the image
    // Each operation is a tuple of the operation type and the operation function
    // Storing the operation type allows us to ensure that an operation is only applied once (see apply_operations method)
    // TODO: can potentially make this a HashMap, then we dedupe the operations up front
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
            metadata,
            original_height: dynamic_image.height(),
            original_width: dynamic_image.width(),
            edited_height: dynamic_image.height(),
            edited_width: dynamic_image.width(),
            original_image: dynamic_image.clone(),
            operations: Vec::new(),
        }
    }

    // #[wasm_bindgen(getter)] - this allows us to expose this function to JS as a getter i.e. `myRawImage.width` 👍 `myRawImage.width()` 🙅
    #[wasm_bindgen(getter)]
    pub fn width(&self) -> u32 {
        self.edited_width
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> u32 {
        self.edited_height
    }

    #[wasm_bindgen(getter)]
    pub fn original_width(&self) -> u32 {
        self.original_width
    }

    #[wasm_bindgen(getter)]
    pub fn original_height(&self) -> u32 {
        self.original_height
    }

    #[wasm_bindgen(getter)]
    pub fn metadata(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.metadata)?)
    }

    pub fn apply_operations(&mut self) -> Vec<u8> {
        // create a HashMap to store the operations that need to be applied, deduped by operation type
        let mut deduped_operations = HashMap::new();

        // iterate over the operations (oldest operation first)
        // HashMap will automatically dedupe the operations by operation type, keeping the most recent value
        // the end result of this loop is that we have a HashMap with the most recent operation for each operation type
        for (operation_type, operation) in self.operations.iter() {
            deduped_operations.insert(operation_type, operation);
        }

        let mut edited_image = self.original_image.clone();

        // apply the operations in our desired order

        // Basic Adjustments: White Balance, Exposure, Contrast
        if let Some(operation) = deduped_operations.get(&OperationType::Exposure) {
            operation(&mut edited_image);
        }
        if let Some(operation) = deduped_operations.get(&OperationType::Contrast) {
            operation(&mut edited_image);
        }

        // Tone and Color:

        // Optics and Geometry: Rotation
        if let Some(operation) = deduped_operations.get(&OperationType::Rotation) {
            operation(&mut edited_image);
        }

        self.edited_width = edited_image.width();
        self.edited_height = edited_image.height();
        edited_image.into_rgba8().to_vec()
    }

    pub fn set_exposure(&mut self, value: f32) {
        self.operations.push((
            OperationType::Exposure,
            Box::new(move |image: &mut DynamicImage| {
                image
                    .as_mut_rgb16()
                    .unwrap()
                    .pixels_mut()
                    .for_each(|pixel| {
                        let multiplier = value * 2.0; // we want to scale the multiple by 2, so that the max/min values of 1/-1 are 2/-2. We could do this client-side, but I've chosen to couple it here.
                        let adjust_exposure_for_pixel = |pixel: &mut u16| {
                            // * is a dereference operator, which allows us to modify the value that pixel points to
                            *pixel = (*pixel as f32 * (1.0 + multiplier))
                                .clamp(0.0, RGB_MAX_16BIT as f32)
                                as u16;
                        };
                        adjust_exposure_for_pixel(&mut pixel[0]);
                        adjust_exposure_for_pixel(&mut pixel[1]);
                        adjust_exposure_for_pixel(&mut pixel[2]);
                    });
            }),
        ));
    }

    pub fn set_rotation(&mut self, angle: f32) {
        self.operations.push((
            OperationType::Rotation,
            Box::new(move |image: &mut DynamicImage| match angle {
                90.0 => *image = image.rotate90(),
                180.0 => *image = image.rotate180(),
                270.0 => *image = image.rotate270(),
                _ => (),
            }),
        ));
    }

    pub fn set_contrast(&mut self, contrast: f32) {
        self.operations.push((
            OperationType::Contrast,
            Box::new(move |image: &mut DynamicImage| {
                log::info!("contrast: {}", contrast);
                image
                    .as_mut_rgb16()
                    .unwrap()
                    .pixels_mut()
                    .for_each(|pixel| {
                        // TODO: fix
                        let adjust_contrast_for_pixel = |pixel: &mut u16| {
                            // contrast formula: clamp((pixel - mean) x contrast + mean)
                            let mean: f32 = RGB_MAX_16BIT as f32 / 2.0;
                            *pixel = ((*pixel as f32 - mean) * (1.0 + contrast) + mean).clamp(0.0, RGB_MAX_16BIT as f32) as u16;
                        };
                        adjust_contrast_for_pixel(&mut pixel[0]);
                        adjust_contrast_for_pixel(&mut pixel[1]);
                        adjust_contrast_for_pixel(&mut pixel[2]);
                    });
            }),
        ));
    }

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
