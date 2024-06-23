### todo

- storing edits either JS side or Rust side, and allow for reconciliation
- loading states

# 🚧 Raw Editor

## Libraries and stack

**Svelte** for the app ui

**Rust** for handling image processing, compiled to WASM using `wasm-pack`

**rawler** Raw image processing library, handles decoding image data and metadata, performs basic processing i.e. demosaicing, and provides a `RawDevelop` module for further developing the raw data.

**image** Image library, which provides many useful utilisies for manipulating images - decoding, encoding etc... Works in conjunction with `rawler`

**console_error_panic_hook** brilliant library for surfacing panic messages from rust, straight to the javascript console

**wasm_logger** another great library for binding the `log` create to the browser console

**comlink** A small RPC library for Web Workers

## System Diagram

Goto: [https://excalidraw.com/](https://excalidraw.com/)

Then, via the hamburger menu, click Open, and open [system-diagram.excalidraw](./system-diagram.excalidraw)

## Prerequisites

- Rust environment
- Node environment
  - pnpm

This can be setup using devbox, to enter a pre-configured shell environment:

```
devbox shell
```

## Running the app

### Development

```
pnpm dev
```

This will first run `pnpm build:wasm` to build the wasm module, then, it will start the Svelte dev server.

> as part of `pnpm build:wasm`, the WASM files are output into `src/lib/raw-processor`, allowing for the Svelte code (on in this case the worker files) to import the WASM code.

## Project structure

```
raw-processor/
└── lib.rs - 🦀 Main entry point to the rust logic for handling image processing
src/ - ⚡ Svelte application source code
└── lib/ - components, state etc... general UI code can be found here
    └── raw-processor/ - 📦 🦀 The compiled WASM code - this will exist upon running `pnpm build:wasm`
    └── components/ - UI components
    └── workers/ - Web Worker files
└── routes/ - where the pages are defined
devbox.json - 🌍 Defining the devbox development environment i.e. rust, node
Cargo.toml - 🦀 Where the rust wasm module is configured (dependencies)
```

## Making changes

### Rust WASM - Raw Processor

To update the rust raw processing module, and the exposed methods (that can be used in javascript), edit `raw-processor/lib.rs`, or any related `.rs` file inside of `raw-processor/`

### Svelte UI

Changes to the UI can be made inside of the `src` directory

## Compilation

To compile to wasm run

```
pnpm build:wasm
```

- This will use `wasm-pack` to compile to a wasm target
  - This will compile the file as defined in `Cargo.toml`
- output can be found in `src/lib/raw-processor/`
- we can then import raw-editor.js into our application and call `init`. This will fetch the wasm binary and instantiate it.

## Linking our WASM module to our Vite project

The simplest, bug-free way of consuming the WASM module was to simply copy it into the Svelte source code `src/lib/raw-processor`

In doing so, I can simply import the WASM Javascript file, without relying on Vite to know how to properly link the file, as was the case when trying:

- `pnpm link`
- Monorepo style package imports

## Concurrency

`wasm-bindgen-rayon`

follwing setup as described in their README

- using nightly rust to allow -Z build-std...
- customisation RUSTFLAGS, to enable atomics and bulk-memory features
- enabling COOP, and COEP to allow the use of SharedArrayBuffer (Sveltekit hooks) TODO

This would be ideal, however, my attempts to implement this ran into some issues which I struggled to address. So the solution for now is not optimised for speed.

## Freeing the UI Main Thread

- Image processing is a CPU intensive task, if the functions are invoked on the main thread, it would pause all UI interactions for the duration of the invocation.
- To mitigate this, the image prcessing code can be executed from a Web Worker

## Implementing commutative operations

> Commutative: involving the condition that a group of quantities connected by operators gives the same result whatever the order of the quantities involved, e.g. a × b = b × a

A question that may arise when building an image editor, is how can we apply the same operations, regardless of order, and yield the same result. This is the behaviour in which the user will expect.

e.g.

If red pixel value is 100...
The user first applies 1.5x exposure, and then +20 red. The final pixel value is 170 ((100 x 1.5) + 20).

But if the user applies +20 red, then 1.5x exposure. The final pixel value is 180 ((100 + 20) x 1.5).

The solution is simple, the user applies the operations in any order, but under the hood, the image processor will always apply the operations in the same order. This is what other editors such as Lightroom, Rawtherapee etc... do in order to provide consistency in the operations.

<details>
<summary>A typical order of operations</summary>

#### 1. **Basic Adjustments**

- **White Balance:** Adjust the white balance first to correct color casts and set a neutral tone for further edits.
- **Exposure:** Set the overall brightness of the image.
- **Contrast:** Enhance the difference between light and dark areas.
- **Highlights and Shadows:** Recover details in the highlights (bright areas) and shadows (dark areas).
- **Whites and Blacks:** Set the white and black points to define the range of tonal values.

#### 2. **Tone and Color Adjustments**

- **Tone Curve:** Fine-tune contrast and brightness across specific tonal ranges.
- **HSL/Color Adjustments:** Adjust individual colors for hue, saturation, and luminance.

#### 3. **Local Adjustments**

- **Gradients and Brushes:** Apply local adjustments using gradient filters or adjustment brushes to specific parts of the image.
- **Vignetting:** Apply vignetting to darken or lighten the edges of the image.

#### 4. **Detail Enhancements**

- **Sharpening:** Enhance edge details and overall sharpness.
- **Noise Reduction:** Reduce luminance and color noise, especially in high ISO images.
- **Clarity and Texture:** Increase midtone contrast (clarity) and enhance fine details (texture).

#### 5. **Optics and Geometry**

- **Lens Corrections:** Correct lens distortions such as vignetting, chromatic aberration, and geometric distortions.
- **Cropping and Straightening:** Crop and straighten the image for composition.
- **Perspective Corrections:** Adjust perspective distortions, especially in architectural photography.

#### 6. **Final Adjustments and Export**

- **Effects:** Add finishing effects like film grain or artistic filters.
- **Output Sharpening:** Apply sharpening tailored to the intended output medium (screen, print, etc.).
- **Export Settings:** Choose the appropriate export settings such as file format, resolution, and color profile.
</details>

## Other notes

- Originally, I wanted to use LibRaw, but with my lack of knowledge around C, it ran into many obstacles in compiling the program to WASM
- The start of this project (not in git history) used `rawloader` and `imagepipe` by pedrocr, for processing the raw files. However, this was very quickly replaced with `rawler` as `rawler` was less of a black box and provided a more transparent API interface for manipulating the raw files.
- I am using a custom fork of ~~`imagepipe`~~ `rawler`, this is because the original library used `std::time` for logging. However, this is unavailable in WebAssembly at runtime. The forked library removes this logging.

## Glossary

**CFA**
what is CFA (TODO)

**Demosaicing**

## Credits & Inspiration

Big shoutout to these libraries

- `rawloader`
- `imagepipe`
- `rawler`
- `tokyo`
- `comlink`
