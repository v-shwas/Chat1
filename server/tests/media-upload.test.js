/**
 * Media upload tests — POST /api/upload
 *
 * Tests every allowed media type with real binary payloads and records the
 * full API response (status, headers, body) for each case.
 *
 * Media bytes used here are the smallest structurally-valid files for each
 * format so tests run fast without any external fixtures.
 */

import request from "supertest";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { TEST_SECRET, createTestUser } from "./helpers.js";
import buildApp from "./testApp.js";

process.env.SECRET_KEY = TEST_SECRET;

let app;
let token;

// ── real binary media payloads ─────────────────────────────────────────────────
// token is re-created after each clearTestDB so protectRoute always finds the user

/**
 * 1×1 transparent PNG (67 bytes) — smallest valid PNG.
 */
const PNG_1x1 = Buffer.from(
  "89504e470d0a1a0a" +           // PNG signature
  "0000000d49484452" +           // IHDR chunk length + type
  "00000001" +                   // width = 1
  "00000001" +                   // height = 1
  "08060000001f15c489" +         // bit depth=8, colorType=6 (RGBA), ...
  "0000000a49444154" +           // IDAT chunk
  "789c6260000000020001" +
  "e221bc33" +
  "0000000049454e44ae426082",    // IEND
  "hex"
);

/**
 * Minimal JPEG (SOI + APP0 + EOI) — just enough to pass MIME validation.
 * Browsers accept this as a valid jpeg structure.
 */
const JPEG_MINIMAL = Buffer.from(
  "ffd8ffe000104a4649460001010000010001" + // SOI + APP0 marker
  "0000" +                                  // thumbnail dimensions
  "ffd9",                                   // EOI
  "hex"
);

/**
 * 1×1 WebP (RIFF container, smallest VP8L lossless image).
 */
const WEBP_1x1 = Buffer.from(
  "52494646" +   // "RIFF"
  "24000000" +   // file size (little-endian)
  "57454250" +   // "WEBP"
  "56503820" +   // "VP8 " chunk type
  "1c000000" +   // chunk size
  "30010000" +   // frame tag
  "9d012a01000100003425a4000310700000fef8508000",
  "hex"
);

/**
 * Minimal GIF89a (1×1 pixel, 1 colour).
 */
const GIF_1x1 = Buffer.from(
  "47494638396101000100" + // GIF89a, 1x1
  "8000" +                  // global colour table flag
  "00" +                    // background colour index
  "00" +                    // pixel aspect ratio
  "ffffff" +                // colour table: white
  "000000" +                // padding
  "2c" +                    // image descriptor
  "0000000001000100" +      // left, top, w, h
  "00" +                    // packed field
  "02" +                    // LZW min code size
  "024c01003b",             // image data + GIF trailer
  "hex"
);

/**
 * Minimal WebM audio container (EBML header + Segment).
 * Enough to pass MIME-type-based validation.
 */
const WEBM_AUDIO = Buffer.from(
  "1a45dfa3" +     // EBML ID
  "9f" +           // EBML size (1-byte vint: 31 bytes follow)
  "4286810142f7810142f281044282844d61747256" +
  "6120018a45dfa39f00",
  "hex"
);

/**
 * Minimal PDF (header + EOF marker).
 */
const PDF_MINIMAL = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF");

/**
 * Plain text — UTF-8 string.
 */
const TXT_CONTENT = Buffer.from("Hello from the chat test suite!\nLine two.");

/**
 * Minimal ZIP (empty archive — end of central directory record only).
 */
const ZIP_EMPTY = Buffer.from(
  "504b0506" +   // end-of-central-directory signature
  "0000" +       // disk number
  "0000" +       // disk with central dir
  "0000" +       // entries on disk
  "0000" +       // total entries
  "00000000" +   // central dir size
  "00000000" +   // central dir offset
  "0000",        // comment length
  "hex"
);

// ── setup ─────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
  app = buildApp();
});

afterAll(disconnectTestDB);

// Re-create the user after each clear so protectRoute always finds them
beforeEach(async () => {
  await clearTestDB();
  ({ token } = await createTestUser({ username: "mediauploader", email: "media@test.com" }));
});

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Upload a buffer and return the full supertest Response object so callers
 * can inspect status, headers, and body in one place.
 */
async function upload(buffer, filename, contentType, authToken = token) {
  return request(app)
    .post("/api/upload")
    .set("Authorization", `Bearer ${authToken}`)
    .attach("file", buffer, { filename, contentType });
}

/** Pretty-print a response for snapshot / recording. */
function recordResponse(label, res) {
  return {
    label,
    status: res.status,
    contentType: res.headers["content-type"],
    body: res.body,
  };
}

// ── image uploads ─────────────────────────────────────────────────────────────

describe("Image uploads", () => {
  it("PNG — uploads successfully and returns correct metadata", async () => {
    const res = await upload(PNG_1x1, "photo.png", "image/png");
    const record = recordResponse("PNG upload", res);

    expect(record.status).toBe(201);
    expect(record.body.url).toMatch(/^\/uploads\/.+\.png$/);
    expect(record.body.fileName).toBe("photo.png");
    expect(record.body.mimeType).toBe("image/png");
    expect(typeof record.body.fileSize).toBe("number");
    expect(record.body.fileSize).toBeGreaterThan(0);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("JPEG — uploads successfully and returns correct metadata", async () => {
    const res = await upload(JPEG_MINIMAL, "image.jpg", "image/jpeg");
    const record = recordResponse("JPEG upload", res);

    expect(record.status).toBe(201);
    expect(record.body.url).toMatch(/^\/uploads\/.+\.jpg$/);
    expect(record.body.mimeType).toBe("image/jpeg");
    expect(record.body.fileName).toBe("image.jpg");
    expect(record.body.fileSize).toBeGreaterThan(0);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("WebP — uploads successfully and returns correct metadata", async () => {
    const res = await upload(WEBP_1x1, "picture.webp", "image/webp");
    const record = recordResponse("WebP upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("image/webp");
    expect(record.body.url).toMatch(/\.webp$/);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("GIF — uploads successfully and returns correct metadata", async () => {
    const res = await upload(GIF_1x1, "animation.gif", "image/gif");
    const record = recordResponse("GIF upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("image/gif");
    expect(record.body.url).toMatch(/\.gif$/);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("fileSize in response matches the actual buffer size", async () => {
    const res = await upload(PNG_1x1, "size-check.png", "image/png");
    expect(res.body.fileSize).toBe(PNG_1x1.length);
  });
});

// ── audio uploads ─────────────────────────────────────────────────────────────

describe("Audio uploads", () => {
  it("WebM audio — uploads successfully", async () => {
    const res = await upload(WEBM_AUDIO, "voice.webm", "audio/webm");
    const record = recordResponse("WebM audio upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("audio/webm");
    expect(record.body.url).toMatch(/\.webm$/);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("audio/ogg — uploads successfully", async () => {
    const oggContent = Buffer.from("OggS" + "0".repeat(60)); // fake ogg header
    const res = await upload(oggContent, "audio.ogg", "audio/ogg");
    const record = recordResponse("OGG audio upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("audio/ogg");

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("audio/mpeg (MP3) — uploads successfully", async () => {
    // ID3v2 header + sync frame
    const mp3Content = Buffer.from("494433" + "03000000000000" + "fffb9000", "hex");
    const res = await upload(mp3Content, "track.mp3", "audio/mpeg");
    const record = recordResponse("MP3 upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("audio/mpeg");

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("audio/wav — uploads successfully", async () => {
    // RIFF/WAVE header (44 bytes) — minimal valid WAV
    const wav = Buffer.alloc(44);
    wav.write("RIFF", 0);
    wav.writeUInt32LE(36, 4);      // file size - 8
    wav.write("WAVE", 8);
    wav.write("fmt ", 12);
    wav.writeUInt32LE(16, 16);     // PCM chunk size
    wav.writeUInt16LE(1, 20);      // PCM format
    wav.writeUInt16LE(1, 22);      // 1 channel
    wav.writeUInt32LE(44100, 24);  // sample rate
    wav.writeUInt32LE(88200, 28);  // byte rate
    wav.writeUInt16LE(2, 32);      // block align
    wav.writeUInt16LE(16, 34);     // bits per sample
    wav.write("data", 36);
    wav.writeUInt32LE(0, 40);      // data chunk size

    const res = await upload(wav, "sound.wav", "audio/wav");
    const record = recordResponse("WAV upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("audio/wav");
    expect(record.body.fileSize).toBe(44);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });
});

// ── document uploads ──────────────────────────────────────────────────────────

describe("Document uploads", () => {
  it("PDF — uploads successfully", async () => {
    const res = await upload(PDF_MINIMAL, "report.pdf", "application/pdf");
    const record = recordResponse("PDF upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("application/pdf");
    expect(record.body.fileName).toBe("report.pdf");
    expect(record.body.url).toMatch(/\.pdf$/);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("TXT — uploads successfully", async () => {
    const res = await upload(TXT_CONTENT, "notes.txt", "text/plain");
    const record = recordResponse("TXT upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("text/plain");
    expect(record.body.fileSize).toBe(TXT_CONTENT.length);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("ZIP — uploads successfully", async () => {
    const res = await upload(ZIP_EMPTY, "archive.zip", "application/zip");
    const record = recordResponse("ZIP upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe("application/zip");
    expect(record.body.url).toMatch(/\.zip$/);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("DOCX — uploads successfully", async () => {
    // DOCX is a ZIP under the hood — use ZIP_EMPTY with the right MIME type
    const res = await upload(
      ZIP_EMPTY,
      "resume.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    const record = recordResponse("DOCX upload", res);

    expect(record.status).toBe(201);
    expect(record.body.mimeType).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(record.body.url).toMatch(/\.docx$/);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });
});

// ── rejection cases ───────────────────────────────────────────────────────────

describe("Rejected media types", () => {
  const REJECTED = [
    { label: "MP4 video", buffer: Buffer.from("fake mp4"), filename: "clip.mp4", mime: "video/mp4" },
    { label: "Windows EXE", buffer: Buffer.from("MZ"), filename: "app.exe", mime: "application/x-msdownload" },
    { label: "JavaScript", buffer: Buffer.from("alert(1)"), filename: "x.js", mime: "application/javascript" },
    { label: "HTML", buffer: Buffer.from("<html/>"), filename: "x.html", mime: "text/html" },
    { label: "SVG", buffer: Buffer.from("<svg/>"), filename: "x.svg", mime: "image/svg+xml" },
  ];

  test.each(REJECTED)("$label ($mime) — rejected with 400", async ({ buffer, filename, mime, label }) => {
    const res = await upload(buffer, filename, mime);
    const record = recordResponse(`Rejected: ${label}`, res);

    expect(record.status).toBe(400);
    expect(record.body.error).toMatch(/not allowed/i);

    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });
});

// ── auth & edge cases ─────────────────────────────────────────────────────────

describe("Auth and edge cases", () => {
  it("returns 401 without Authorization header", async () => {
    const res = await request(app)
      .post("/api/upload")
      .attach("file", PNG_1x1, { filename: "x.png", contentType: "image/png" });

    const record = recordResponse("No auth token", res);
    expect(record.status).toBe(401);
    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("returns 401 with an invalid token", async () => {
    const res = await upload(PNG_1x1, "x.png", "image/png", "Bearer invalid.token.here");
    const record = recordResponse("Invalid token", res);
    expect(record.status).toBe(401);
    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("returns 400 when no file is attached", async () => {
    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`);

    const record = recordResponse("No file attached", res);
    expect(record.status).toBe(400);
    expect(record.body.error).toMatch(/no file uploaded/i);
    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });

  it("response body always includes url, fileName, fileSize, mimeType for valid uploads", async () => {
    const res = await upload(PNG_1x1, "check-fields.png", "image/png");
    expect(res.body).toMatchObject({
      url: expect.stringMatching(/^\/uploads\//),
      fileName: "check-fields.png",
      fileSize: expect.any(Number),
      mimeType: "image/png",
    });
  });

  it("url uses the original file extension, not a made-up one", async () => {
    const res = await upload(PDF_MINIMAL, "contract.pdf", "application/pdf");
    expect(res.body.url).toMatch(/\.pdf$/);
  });

  it("uploads a large-ish valid image (100KB PNG) and records size", async () => {
    // Construct a valid PNG with a large IDAT chunk (just zeroed data)
    // We fake it as a 100KB buffer with the PNG signature at the front
    const largePng = Buffer.alloc(100 * 1024);
    PNG_1x1.copy(largePng); // start with valid PNG header
    const res = await upload(largePng, "large.png", "image/png");

    const record = recordResponse("100KB PNG upload", res);
    expect(record.status).toBe(201);
    expect(record.body.fileSize).toBe(100 * 1024);
    console.log("Response recorded:", JSON.stringify(record, null, 2));
  });
});
