import "../../styles/toast.css";

export default function Toast({ toast }) {

  if (!toast.show) return null;

  return (
    <div className={`toast ${toast.type}`}>
      {toast.message}
    </div>
  );
}