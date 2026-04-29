const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const localUploadRoot = path.join(__dirname, "..", "uploads");

const normalizeFiles = (files) => {
  if (!files) return [];
  return Array.isArray(files) ? files.filter(Boolean) : [files].filter(Boolean);
};

const getLocalStoredPath = (file) => {
  if (file?.filename) return `/uploads/${file.filename}`;
  if (file?.path) return `/uploads/${path.basename(file.path)}`;
  return "";
};

const uploadBufferToCloudinary = (file, { folder = "needo/uploads" } = {}) =>
  new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(upload);
  });

const storeUploadedFiles = async (files, options = {}) => {
  const normalized = normalizeFiles(files);
  if (!normalized.length) return [];

  if (!isCloudinaryConfigured) {
    return normalized.map(getLocalStoredPath).filter(Boolean);
  }

  const uploads = await Promise.all(
    normalized.map((file) => uploadBufferToCloudinary(file, options))
  );

  return uploads.map((item) => item.secure_url).filter(Boolean);
};

const storeUploadedFile = async (file, options = {}) => {
  const [stored] = await storeUploadedFiles(file ? [file] : [], options);
  return stored || "";
};

const parseCloudinaryAsset = (storedPath) => {
  if (!/^https?:\/\/res\.cloudinary\.com\//i.test(storedPath || "")) {
    return null;
  }

  try {
    const assetUrl = new URL(storedPath);
    const segments = assetUrl.pathname.split("/").filter(Boolean);
    const resourceIndex = segments.findIndex((segment) =>
      ["image", "video", "raw"].includes(segment)
    );

    if (resourceIndex === -1 || segments[resourceIndex + 1] !== "upload") {
      return null;
    }

    let publicIdParts = segments.slice(resourceIndex + 2);
    if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }
    if (!publicIdParts.length) return null;

    const lastPart = publicIdParts[publicIdParts.length - 1].replace(/\.[^/.]+$/, "");
    publicIdParts[publicIdParts.length - 1] = lastPart;

    return {
      resourceType: segments[resourceIndex],
      publicId: publicIdParts.join("/"),
    };
  } catch {
    return null;
  }
};

const deleteLocalAsset = async (storedPath) => {
  if (!storedPath || /^https?:\/\//i.test(storedPath)) return false;

  const fullPath = path.join(__dirname, "..", String(storedPath).replace(/^\/+/, ""));
  await fs.promises.unlink(fullPath).catch((error) => {
    if (error.code !== "ENOENT") {
      throw error;
    }
  });
  return true;
};

const deleteStoredAsset = async (storedPath) => {
  if (!storedPath) return false;

  const cloudinaryAsset = parseCloudinaryAsset(storedPath);
  if (cloudinaryAsset && isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(cloudinaryAsset.publicId, {
        resource_type: cloudinaryAsset.resourceType,
        type: "upload",
        invalidate: true,
      });
      return true;
    } catch (error) {
      console.error("Cloudinary delete failed:", storedPath, error.message);
      return false;
    }
  }

  try {
    return await deleteLocalAsset(storedPath);
  } catch (error) {
    console.error("Local file delete failed:", storedPath, error.message);
    return false;
  }
};

module.exports = {
  isCloudinaryConfigured,
  localUploadRoot,
  storeUploadedFile,
  storeUploadedFiles,
  deleteStoredAsset,
};
