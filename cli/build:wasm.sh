# rust-src is needed for -Z build-std=panic_abort,std, as required by wasm-bindgen-rayon
rustup component add rust-src
export RUSTFLAGS="-C target-feature=+atomics,+bulk-memory,+mutable-globals" # features needed for wasm-bindgen-rayon
# build-std=panic_abort,std is needed for wasm-bindgen-rayon, . is the path to the Cargo.toml file (this command runs in the same directory as Cargo.toml)
wasm-pack build --target web --out-dir ./src/lib/raw-processor -- . -Z build-std=panic_abort,std