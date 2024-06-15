### todo

- storing edits either JS side or Rust side, and allow for reconciliation
- excalidraw system diagram
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
