export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "supermarket");

  const response = await fetch("https://api.cloudinary.com/v1_1/dib27nfbq/image/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.secure_url;
};
