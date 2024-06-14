use std::borrow::BorrowMut;

use crate::Edits;
use image::{DynamicImage, GenericImage, GenericImageView};

pub struct Editor {
    pub(crate) dynamic_image: DynamicImage,
    pub(crate) edits: Edits,
}

impl Editor {
    // ℹ️ I need &self so that it is not a static method on the class (within Javascript)
    // i.e. `myRawImage.ops.increase_exposure(myRawImage)` 👍
    // without &self, Javascript would expect `Operations.increase_exposure(myRawImage)`
    fn exposure(&self, img: &mut DynamicImage, multiplier: f32) {
        // let mut img = ri.dynamic_image.clone();
        // let out = ImageBuffer::from_fn(img.width(), img.height(), |x, y| {
        //     let pixel = img.get_pixel(x, y);
        //     let mut new_pixel = pixel.clone();
        //     new_pixel[0] = (new_pixel[0] as f32 * (1.0 + multiplier)) as u8;
        //     new_pixel[1] = (new_pixel[1] as f32 * (1.0 + multiplier)) as u8;
        //     new_pixel[2] = (new_pixel[2] as f32 * (1.0 + multiplier)) as u8;
        //     new_pixel
        // });

        // let new_img = image::DynamicImage::ImageRgba8(out);

        // let mut rgb = img.as_rgb32f().unwrap();

        // rgb.pixels_mut().for_each(|pixel| {
        //     let f = pixel[0];
        //     pixel[0] = pixel[0] * (1.0 + multiplier);
        //     pixel[1] = pixel[1] * (1.0 + multiplier);
        //     pixel[2] = pixel[2] * (1.0 + multiplier);
        // });

        // img.pixels().for_each(|(x, y, pixel)| {
        //     let mut new_pixel = pixel.clone();
        //     new_pixel[0] = new_pixel[0].saturating_add(10);
        //     new_pixel[1] = new_pixel[1].saturating_add(10);
        //     new_pixel[2] = new_pixel[2].saturating_add(10);
        //     img.put_pixel(x, y, new_pixel);
        // });

        let (width, height) = img.dimensions();

        for x in 0..width {
            for y in 0..height {
                let pixel = img.get_pixel(x, y);
                let mut new_pixel = pixel.clone();
                new_pixel[0] = (new_pixel[0] as f32 * (1.0 + multiplier)).min(255.0) as u8;
                new_pixel[1] = (new_pixel[1] as f32 * (1.0 + multiplier)).min(255.0) as u8;
                new_pixel[2] = (new_pixel[2] as f32 * (1.0 + multiplier)).min(255.0) as u8;
                img.put_pixel(x, y, new_pixel);
            }
        }
        log::info!("increased exposure");
        log::info!("{}", img.get_pixel(0, 0)[0]);
        // ri.dynamic_image = new_img;
    }

    fn rotate_image(&self, mut img: &mut DynamicImage, rotation: u16) {
        let mut newimg = match rotation {
            90 => img.rotate90(),
            180 => img.rotate180(),
            270 => img.rotate270(),
            _ => img.clone(),
        };
    }

    pub fn process(&self) -> DynamicImage {
        let mut img = self.dynamic_image.clone();
        let edits = self.edits.clone();
        self.exposure(&mut img, edits.exposure());
        self.rotate_image(&mut img, edits.rotation());

        img
    }
}
