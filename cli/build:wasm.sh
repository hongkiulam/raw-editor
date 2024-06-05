echo "📦 Building WASM..."
pnpm exec wasm-pack build --target web --out-dir ./raw-processor/pkg
echo "📦 WASM built successfully!"

# ℹ️ We copy here, even though the vite plugin does it for us, because the plugin runs once when the server starts
# Copying here allows us to make changes to the WASM module after the server has started
echo "➡️ Copying WASM to node_modules..."
# if node_modules exists, then if node_modules/raw-processor exists. then remove it
if [ -d "node_modules/raw-processor" ]; then
  rm -rf node_modules/raw-processor
fi
# create node_modules folder if it doesn't exist
mkdir -p node_modules
# copy raw-processor/pkg to node_modules/raw-processor
cp -r ./raw-processor/pkg node_modules/raw-processor
echo "➡️ WASM copied to node_modules successfully!"