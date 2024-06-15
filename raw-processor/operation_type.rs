use std::hash::{Hash, Hasher};
/// Represents the different types of operations that can be performed on an image.
pub enum OperationType {
    /// Exposure adjustment operation.
    Exposure,
    /// White balance adjustment operation.
    WhiteBalance,
    /// Rotation operation.
    Rotation,
    // Add other operation types here
}

impl PartialEq for OperationType {
    /// Checks if two `OperationType` values are equal.
    fn eq(&self, other: &Self) -> bool {
        std::mem::discriminant(self) == std::mem::discriminant(other)
    }
}

impl Eq for OperationType {}

impl Hash for OperationType {
    /// Hashes the `OperationType` value.
    fn hash<H: Hasher>(&self, state: &mut H) {
        std::mem::discriminant(self).hash(state);
    }
}
