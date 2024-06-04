# Raw Loader

## Libraries and stack

**Rust** for handling image processing, compiled to WASM using `wasm-pack`
**rawler** Raw image processing library, handles decoding image data and metadata, performs basic processing i.e. demosaicing, and provides a `RawDevelop` module for further developing the raw data.
**image** Image library, which provides many useful utilisies for manipulating images - decoding, encoding etc... Works in conjunction with `rawler`
**console_error_panic_hook** brilliant library for surfacing panic messages from rust, straight to the javascript console
**wasm_logger** another great library for binding the `log` create to the browser console

## Prerequisites

- Rust environment
- Node environment

This can be setup using devbox, to enter a pre-configured shell environment:

```
devbox shell
```

## Running the app

## Project structure

```
rust-raw/
└── lib.rs - 🦀 Main entry point to the rust logic for handling image processing
devbox.json - 🌍 Defining the devbox development environment i.e. rust, node
```

## Making changes

Changes to the raw loader and the exposed methods that can be used in javascript, edit `rust-raw/lib.rs`

## Compilation

To compile to wasm run

```
devbox run build
```

- This will use `wasm-pack` to compile to a wasm target
  - This will compile the file as defined in `Cargo.toml`
- output can be found in `pkg`
- we can then import raw-editor.js into our application and call `init`. This will fetch the wasm binary and instantiate it.

## Other notes

- Originally, I wanted to use LibRaw, but with my lack of knowledge around C, it ran into many obstacles in compiling the program to WASM
- The start of this project (not in git history) used `rawloader` and `imagepipe` by pedrocr, for processing the raw files. However, this was very quickly replaced with `rawler` as `rawler` was less of a black box and provided a more transparent API interface for manipulating the raw files.
- I am using a custom fork of ~~`imagepipe`~~ `rawler`, this is because the original library used `std::time` for logging. However, this is unavailable in WebAssembly at runtime. The forked library removes this logging.

## Glossary

**CFA**
what is CFA (TODO)

**Demosaicing**

## Credits & Inspiration

- `rawloader`
- `imagepipe`
- `rawler`
- `tokyo`
