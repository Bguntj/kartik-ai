import { uploadFile } from "../services/upload";
import { uploadImage } from "../services/imageUpload";

export async function handleUpload(sessionId, file) {

  if (!file || !sessionId) return;

  const imageTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
  ];

  if (imageTypes.includes(file.type)) {

    return await uploadImage(sessionId, file);

  }

  return await uploadFile(sessionId, file);

}