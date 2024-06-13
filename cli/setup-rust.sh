echo "Setting up rust..."
# we are in /$root/cli. so we need to go up one level to get to the root of the project
projectDir=$(dirname $(dirname $(readlink -f "$0")))
rustupHomeDir="$projectDir"/.rustup
mkdir -p $rustupHomeDir
export RUSTUP_HOME=$rustupHomeDir
export LIBRARY_PATH=$LIBRARY_PATH:"$projectDir"/nix/profile/default/lib
# nightly version is needed for wasm-bindgen-rayon
rustup default nightly-2024-06-12
# rust-src is needed for -Z build-std=panic_abort,std, as required by wasm-bindgen-rayon
rustup component add rust-src
# wasm-pack is needed for building wasm
echo "Installing wasm-pack..."
cargo install wasm-pack --version 0.12.1
echo "Fetching crates..."
cargo fetch