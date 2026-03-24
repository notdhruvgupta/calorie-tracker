export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-light rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {title && (
          <h2 className="font-heading text-xl font-bold mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
