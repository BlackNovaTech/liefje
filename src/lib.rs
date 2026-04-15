#![deny(clippy::all)]

use napi_derive::napi;

#[napi]
pub struct ElfBinary {
    inner: lief::elf::Binary,
}

#[napi]
impl ElfBinary {
    #[napi(constructor)]
    pub fn new(path: String) -> napi::Result<ElfBinary> {
        match lief::elf::Binary::parse(&path) {
            Some(binary) => Ok(ElfBinary { inner: binary }),
            None => Err(napi::Error::from_reason("failed to parse elf binary")),
        }
    }

    /// Add a DT_NEEDED shared library entry.
    #[napi]
    pub fn add_library(&mut self, name: String) {
        self.inner.add_library(&name);
    }

    /// Write the (modified) binary to the given output path.
    #[napi]
    pub fn write(&mut self, output_path: String) {
        self.inner.write(&output_path);
    }
}
