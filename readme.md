# Raw Editor

## Libraries and stack

**Svelte** for the app ui
**Rust** for handling image processing, compiled to WASM using `wasm-pack`
**rawler** Raw image processing library, handles decoding image data and metadata, performs basic processing i.e. demosaicing, and provides a `RawDevelop` module for further developing the raw data.
**image** Image library, which provides many useful utilisies for manipulating images - decoding, encoding etc... Works in conjunction with `rawler`
**console_error_panic_hook** brilliant library for surfacing panic messages from rust, straight to the javascript console
**wasm_logger** another great library for binding the `log` create to the browser console

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

This will first run `pnpm build:wasm` to build the wasm module, second a vite plugin will copy the module into node modules, finally the svelte application is ran in development mode

## Project structure

```
raw-processor/
└── pkg/ - 📦 The compiled WASM code - this will exist upon running `pnpm build:wasm`
└── lib.rs - 🦀 Main entry point to the rust logic for handling image processing
src/ - ⚡ Svelte application source code
devbox.json - 🌍 Defining the devbox development environment i.e. rust, node
Cargo.toml - 🦀 Where the rust wasm module is configured (dependencies)
```

## Making changes

### Rust WASM - Raw Processor

To update the rust raw processing module, and the exposed methods (that can be used in javascript), edit `raw-processor/lib.rs`

### Svelte UI

Changes to the UI can be made inside of the `src` directory

## Compilation

To compile to wasm run

```
pnpm build:wasm
```

- This will use `wasm-pack` to compile to a wasm target
  - This will compile the file as defined in `Cargo.toml`
- output can be found in `rust-raw/wasm`
- we can then import raw-editor.js into our application and call `init`. This will fetch the wasm binary and instantiate it.

## Other notes

- Originally, I wanted to use LibRaw, but with my lack of knowledge around C, it ran into many obstacles in compiling the program to WASM
- The start of this project (not in git history) used `rawloader` and `imagepipe` by pedrocr, for processing the raw files. However, this was very quickly replaced with `rawler` as `rawler` was less of a black box and provided a more transparent API interface for manipulating the raw files.
- I am using a custom fork of ~~`imagepipe`~~ `rawler`, this is because the original library used `std::time` for logging. However, this is unavailable in WebAssembly at runtime. The forked library removes this logging.
- For me, the best way of consuming the WASM module in Vite was to use `pnpm link`. To create that link, I ran `pnpm add ./raw-processor/pkg -D`. As long as the WASM module exists in `raw-processor/pkg`, Vite would pick it up and allow importing from `raw-processor`. There is some black magic involved with `pnpm link` which meant that the module is treated as an asset and accessible correctly from `//host/wasm_files`. Lastly, to ensure the availability of the WASM code, I have added `pre-` scripts to `dev` and `build` which build the WASM module.

### Canvas Stack

## Glossary

**CFA**
what is CFA (TODO)

**Demosaicing**

## Credits & Inspiration

- `rawloader`
- `imagepipe`
- `rawler`
- `tokyo`
