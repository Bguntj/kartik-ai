import { useState } from "react";

export default function useDragDrop(onDropFile) {

  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {

    e.preventDefault();

    setDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {

      onDropFile(file);

    }

  };

  return {

    dragging,

    handleDragOver,

    handleDragLeave,

    handleDrop,

  };

}