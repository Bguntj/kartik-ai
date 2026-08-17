import API from "./api";

export const uploadImage = async (sessionId, file) => {

  const formData = new FormData();

  formData.append("file", file);

  const res = await API.post(
    `/upload-image?session_id=${sessionId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;

};