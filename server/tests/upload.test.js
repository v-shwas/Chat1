/**
 * Upload route tests
 * POST /api/upload
 *
 * Uses supertest's .attach() to simulate multipart/form-data uploads.
 * Files are actually written to disk by multer; we clean them up after.
 */

import request from "supertest";
import path from "path";
import fs from "fs";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { TEST_SECRET, createTestUser } from "./helpers.js";
import buildApp from "./testApp.js";

process.env.SECRET_KEY = TEST_SECRET;

// __dirname equivalent without import.meta (Babel compiles this to CJS __dirname)
const UPLOADS_DIR = path.join(__dirname, "../uploads");

let app;

// Track uploaded files so we can clean them up
const uploadedFiles = [];

beforeAll(async () => {
  await connectTestDB();
  app = buildApp();

  // Ensure the uploads directory exists (multer requires it)
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
});

afterAll(async () => {
  // Remove any files written during tests
  uploadedFiles.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {
      // best-effort cleanup
    }
  });
  await disconnectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * A 1×1 white PNG (68 bytes) — minimal valid PNG for testing.
 */
const MINIMAL_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6260000000020001e221bc330000000049454e44ae426082",
  "hex"
);

const MINIMAL_JPEG = Buffer.from(
  "ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffda00080101000000011f00",
  "hex"
);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/upload", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app)
      .post("/api/upload")
      .attach("file", MINIMAL_PNG, {
        filename: "test.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(401);
  });

  it("uploads a valid PNG image and returns file metadata", async () => {
    const { token } = await createTestUser({
      username: "uploadPng",
      email: "uploadPng@example.com",
    });

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", MINIMAL_PNG, {
        filename: "test-image.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("url");
    expect(res.body.url).toMatch(/^\/uploads\//);
    expect(res.body).toHaveProperty("fileName", "test-image.png");
    expect(res.body).toHaveProperty("fileSize");
    expect(res.body).toHaveProperty("mimeType", "image/png");

    // Track for cleanup
    const diskPath = path.join(UPLOADS_DIR, path.basename(res.body.url));
    uploadedFiles.push(diskPath);
  });

  it("uploads a valid JPEG image and returns file metadata", async () => {
    const { token } = await createTestUser({
      username: "uploadJpeg",
      email: "uploadJpeg@example.com",
    });

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", MINIMAL_JPEG, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.mimeType).toBe("image/jpeg");

    const diskPath = path.join(UPLOADS_DIR, path.basename(res.body.url));
    uploadedFiles.push(diskPath);
  });

  it("rejects a file with a disallowed MIME type", async () => {
    const { token } = await createTestUser({
      username: "uploadInvalid",
      email: "uploadInvalid@example.com",
    });

    // video/mp4 is not in the allowed list
    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("fake video content"), {
        filename: "video.mp4",
        contentType: "video/mp4",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not allowed/i);
  });

  it("returns 400 when no file is attached", async () => {
    const { token } = await createTestUser({
      username: "uploadNoFile",
      email: "uploadNoFile@example.com",
    });

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no file uploaded/i);
  });

  it("uploads a PDF and returns the correct metadata", async () => {
    const { token } = await createTestUser({
      username: "uploadPdf",
      email: "uploadPdf@example.com",
    });

    // Minimal PDF header
    const pdfContent = Buffer.from("%PDF-1.4 fake content for testing");

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", pdfContent, {
        filename: "document.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body.mimeType).toBe("application/pdf");
    expect(res.body.fileName).toBe("document.pdf");

    const diskPath = path.join(UPLOADS_DIR, path.basename(res.body.url));
    uploadedFiles.push(diskPath);
  });

  it("uploads a plain text file successfully", async () => {
    const { token } = await createTestUser({
      username: "uploadTxt",
      email: "uploadTxt@example.com",
    });

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("Hello, world!"), {
        filename: "hello.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(201);
    expect(res.body.mimeType).toBe("text/plain");

    const diskPath = path.join(UPLOADS_DIR, path.basename(res.body.url));
    uploadedFiles.push(diskPath);
  });

  it("rejects an executable file as disallowed MIME type", async () => {
    const { token } = await createTestUser({
      username: "uploadExe",
      email: "uploadExe@example.com",
    });

    const res = await request(app)
      .post("/api/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from("MZ fake exe"), {
        filename: "malware.exe",
        contentType: "application/x-msdownload",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not allowed/i);
  });
});
