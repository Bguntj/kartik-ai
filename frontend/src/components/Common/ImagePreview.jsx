import "../../styles/imagePreview.css";

export default function ImagePreview({
  image,
  onRemove,
}) {

  if (!image) return null;

  return (

    <div className="image-preview">

      <img
        src={URL.createObjectURL(image)}
        alt="Preview"
      />

      <button
        onClick={onRemove}
      >
        ✕
      </button>

    </div>

  );

}