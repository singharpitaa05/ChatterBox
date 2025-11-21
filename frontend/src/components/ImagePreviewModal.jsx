// IMAGE PREVIEW MODAL COMPONENT

import { Download, X } from 'lucide-react';

const ImagePreviewModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
      >
        <X size={32} />
      </button>

      <button
        onClick={handleDownload}
        className="absolute top-4 left-4 text-white hover:text-gray-300 transition flex items-center space-x-2 bg-black/50 px-4 py-2 rounded-lg"
      >
        <Download size={20} />
        <span>Download</span>
      </button>

      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImagePreviewModal;