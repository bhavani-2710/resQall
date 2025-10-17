export const CLOUDINARY_UPLOAD_PRESET = "resqall";
export const CLOUDINARY_CLOUD_NAME = "drrh3span";

export const uploadPhotoToCloudinary = async (photoUri) => {
  if (!photoUri) return null;
  try {
    const data = new FormData();
    data.append("file", { uri: photoUri, type: "image/jpeg", name: "sos_photo.jpg" });
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    );
    const json = await res.json();
    return json.secure_url || null;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return null;
  }
};

export const uploadAudioToCloudinary = async (audioUri) => {
  if (!audioUri) return null;
  try {
    const data = new FormData();
    data.append("file", { uri: audioUri, type: "audio/m4a", name: "sos_audio.m4a" });
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: data }
    );
    const json = await res.json();
    return json.secure_url || null;
  } catch (error) {
    console.error("Audio upload failed:", error);
    return null;
  }
};
