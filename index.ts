import { Reader } from "./reader";
import * as fs from "fs";

let zipPath = "./test.zip";

const compressionSwitch = (compressionBytes: number): string => {
  switch (compressionBytes) {
    case 0:
      return "no compression";
    case 1:
      return "shrunk";
    case 2:
      return "reduced with compression factor 1";
    case 3:
      return "reduced with compression factor 2";
    case 4:
      return "reduced with compression factor 3";
    case 5:
      return "reduced with compression factor 4";
    case 6:
      return "imploded";
    case 7:
      return "reserved";
    case 8:
      return "deflated";
    case 9:
      return "enhanced deflated";
    case 10:
      return "PKWare DCL imploded";
    case 11:
      return "reserved";
    case 12:
      return "compressed using BZIP2";
    case 13:
      return "reserved";
    case 14:
      return "LZMA";
    case 15:
    case 16:
    case 17:
      return "reserved";
    case 18:
      return "compressed using IBM TERSE";
    case 19:
      return "IBM LZ77 z";
    case 98:
      return "PPMd version I, Rev 1";
  }
};

const versionSwitch = (version: Buffer) => {
  let versionBytes = version.readInt16LE();
};

const bufferToString = (buffer: Buffer): string => {
  return buffer.toString("hex").match(/../g).join(" ");
};

const minLength = (input: number, minLength: number): string => {
  let paddedNumber = input.toString();
  while (paddedNumber.length < minLength) {
    paddedNumber = "0" + paddedNumber;
  }
  return paddedNumber;
};

const decimalToBinary = (dec: number): string => {
  return (dec >>> 0).toString(2);
};

const formatModDate = (dateBytes: number): string => {
  let dayByte = dateBytes & 0b0000000_0000_11111;
  let monthByte = (dateBytes >> 5) & 0b0000000_1111;
  let yearByte = dateBytes >> 9;

  return `${minLength(monthByte, 2)}/${minLength(dayByte, 2)}/${minLength(
    yearByte + 1980,
    4
  )}`;
};

const formatModTime = (timeBytes: number): string => {
  let secondByte = timeBytes & 0b00000_000000_11111;
  let minuteByte = (timeBytes >> 5) & 0b00000_111111;
  let hourByte = timeBytes >> 11;

  return `${minLength(hourByte, 2)}:${minLength(minuteByte, 2)}:${minLength(
    secondByte * 2,
    2
  )}`;
};

fs.readFile(zipPath, (err, data) => {
  if (err) console.error(err);

  let signature = data.slice(0, 4);
  const reader = new Reader(signature);
  console.log(reader.endian);
  let extractVersionSlice = data.slice(4, 6);
  let extractVersion = reader.read2Bytes(extractVersionSlice);

  let flags = data.slice(6, 8);
  let compression = data.slice(8, 10);
  let compressionType = compressionSwitch(reader.read2Bytes(compression));
  let modTime = data.slice(10, 12);
  let modTimeFormatted = formatModTime(reader.read2Bytes(modTime));
  let modDate = data.slice(12, 14);
  let modDateFormatted = formatModDate(reader.read2Bytes(modDate));
  let crc32 = data.slice(14, 18);
  let compressedSlice = data.slice(18, 22);
  let compressedSize = reader.read4Bytes(compressedSlice);
  let uncompressedSlice = data.slice(22, 26);
  let uncompressedSize = reader.read4Bytes(uncompressedSlice);
  console.log({
    signature,
    extractVersion,
    flags,
    compressionType,
    modTimeFormatted,
    modDateFormatted,
    crc32,
    compressedSize,
    uncompressedSize,
  });
});
