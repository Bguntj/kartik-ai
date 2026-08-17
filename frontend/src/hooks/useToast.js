import { useState } from "react";

export default function useToast() {

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message,
    type = "success"
  ) => {

    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {

      setToast((prev) => ({
        ...prev,
        show: false,
      }));

    }, 2500);

  };

  return {

    toast,

    showToast,

  };

}