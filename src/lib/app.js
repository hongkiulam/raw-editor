// @ts-check
import init, * as raw_editor from "raw-processor";

const fileInput = /** @type {HTMLInputElement} */ (
  document.getElementById("fileInput")
);
const button = /** @type {HTMLButtonElement} */ (
  document.getElementById("button")
);
const canvas = /** @type {HTMLCanvasElement}*/ (
  document.getElementById("canvas")
);

/** @type {raw_editor.MyRawImage} */
let currentRawImage;

async function run() {
  await init();

  fileInput?.addEventListener("change", async (event) => {
    const file = fileInput?.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const rawImage = raw_editor.decode_raw_image(uint8Array);
    console.log("Width:", rawImage.width);
    console.log("Height:", rawImage.height);
    console.log("size", rawImage.height * rawImage.width * 3);
    console.log("metadata", rawImage.metadata);
    currentRawImage = rawImage;
    renderImageData(rawImage);
  });

  button?.addEventListener("click", async () => {
    if (currentRawImage) {
      currentRawImage.rotate_image();
      renderImageData(currentRawImage);
    }
  });
}

/**
 * Determines a scale ratio to apply to the image in order to have it fit the device screen comfortably
 * @param {raw_editor.MyRawImage} image
 */
const getScaledImageDimensions = (image) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const goodFitHeight = windowHeight * 0.6;
  const scale = goodFitHeight / image.height;

  const desiredWidth = image.width * scale;
  const desiredHeight = image.height * scale;
  return { width: desiredWidth, height: desiredHeight };
};

const pipe =
  (...fns) =>
  (x) => {
    console.log("input", x);

    return fns.reduce((v, f) => {
      const output = f(v);
      console.log(f.name, output);
      return output;
    }, x);
  };

/**
 *
 * @param {Uint8Array} image
 * @returns {Uint8ClampedArray}
 */
const addAlphaChannel = (image) => {
  const out = new Uint8ClampedArray((image.length * 4) / 3);
  // the array contains [r,g,b,r,g,b,r,g,b,...], insert alpha channel
  for (let i = 0, j = 0; i < out.length; i += 4, j += 3) {
    out[i] = image[j]; // Red
    out[i + 1] = image[j + 1]; // Green
    out[i + 2] = image[j + 2]; // Blue
    out[i + 3] = 255; // Alpha (fully opaque)
  }

  return out;
};

const canvasCtx = canvas.getContext("2d");

/** @param {raw_editor.MyRawImage} rawImage */
function renderImageData(rawImage) {
  // todo use offscreen canvas or image bitmap

  const pictureCanvas = document.createElement("canvas");
  const pictureCanvasCtx = pictureCanvas.getContext("2d");
  // Create a new ImageData object from the Uint8Array data
  const imageData = pictureCanvasCtx?.createImageData(
    rawImage.width,
    rawImage.height
  );
  pictureCanvas.width = rawImage.width;
  pictureCanvas.height = rawImage.height;

  if (imageData) {
    // const processedImage = pipe(
    // raw_editor.demosaic,
    // raw_editor.normalize_u16_to_u8,
    // EXPERIMENTAL_increaseExposure,
    // addAlphaChannel,
    // (image) => image
    // )(rawImage.image);
    const processedImage = rawImage.image_as_rgba8;

    imageData?.data.set(processedImage); // Copy the pixel data from the Uint8Array to the ImageData object
    // Put the pixel data onto the canvas
    pictureCanvasCtx?.putImageData(imageData, 0, 0);

    // render picture canvas into another canvas

    // Set the desired dimensions
    const { width: scaledWidth, height: scaledHeight } =
      getScaledImageDimensions(rawImage);

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    // Draw the image from the source canvas to the destination canvas with scaling
    canvasCtx?.drawImage(
      pictureCanvas,
      0,
      0,
      rawImage.width,
      rawImage.height,
      0,
      0,
      scaledWidth,
      scaledHeight
    );
  }
}

run();
