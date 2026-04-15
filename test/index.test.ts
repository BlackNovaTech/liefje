import { expect, describe, it } from "bun:test";
import { ElfBinary } from "..";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

const soPath = "fixtures/libtest.so";

describe("ElfBinary", () => {
  it("fails on parsing a non elf binary", () => {
    expect(() => new ElfBinary("index.js")).toThrowError();
  });
  it("fails on parsing a nonexisting file", () => {
    expect(() => new ElfBinary("doesnotexist")).toThrowError();
  });
  it("parses an ELF lib", () => {
    expect(new ElfBinary(soPath)).toBeInstanceOf(ElfBinary);
  });

  describe("addLibrary", () => {
    it("adds a DL_NEEDED entry", async () => {
      const newLibraryName = "libnewlibrary.so";

      // Shouldn't exist yet
      let buffer = await fs.readFile(soPath);
      expect(buffer.indexOf(newLibraryName)).toBe(-1);

      const bin = new ElfBinary(soPath);
      bin.addLibrary(newLibraryName);

      const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "liefje"));
      try {
        const outPath = path.join(tmpdir, "libtest.so");
        bin.write(outPath);

        // Should now exist on newly written file
        buffer = await fs.readFile(outPath);
        expect(buffer.indexOf(newLibraryName)).toBeGreaterThanOrEqual(0);
      } finally {
        // cleanup
        await fs.rm(tmpdir, { recursive: true, force: true });
      }
    });
  });
});
