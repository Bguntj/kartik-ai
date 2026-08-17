import API from "./api";

export const uploadFile = async (sessionId, file) => {

  const formData = new FormData();

  formData.append("session_id", sessionId);
  formData.append("file", file);

  const isImage = file.type.startsWith("image/");

  const endpoint = isImage
    ? "/upload/image"
    : "/upload/document";

  const res = await API.post(
    endpoint,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;

};