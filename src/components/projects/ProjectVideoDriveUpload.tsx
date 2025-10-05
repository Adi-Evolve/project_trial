import React, { useRef, useState, useCallback } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

// Feature-flag for Drive Picker helper
const ENABLE_DRIVE_PICKER = process.env.REACT_APP_ENABLE_DRIVE_PICKER === 'true';

// NOTE: This component provides a fallback UI (file upload + external link).
// It includes a feature-flagged Drive Picker helper (opens integration instructions) and a drag-drop area.
const ProjectVideoDriveUpload: React.FC<{ onVideoSelect: (url: string) => void }> = ({ onVideoSelect }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [link, setLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setSelectedName(file.name);
    setUploading(true);

    try {
      // In this lightweight implementation we use an object URL as a temporary preview.
      // Production: replace with upload to Supabase storage / IPFS and use the returned public URL.
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onVideoSelect(url);
    } finally {
      setUploading(false);
    }
  }, [onVideoSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUseLink = () => {
    if (!link) return;
    setPreviewUrl(link);
    setSelectedName(null);
    onVideoSelect(link);
  };

  const openDrivePickerHelp = () => {
    // We can't embed OAuth secrets here. Instead open a small helper window with instructions
    // for enabling the Google Drive Picker API and how to wire it into this component.
    const helpHtml = `
      <html>
        <head><title>Drive Picker Setup</title></head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Enable Google Drive Picker</h2>
          <ol>
            <li>Go to Google Cloud Console and create / select a project.</li>
            <li>Enable the Drive API and Drive Picker APIs.</li>
            <li>Create OAuth 2.0 Client ID credentials (Authorized origins should include your app URL).</li>
            <li>Set REACT_APP_GOOGLE_CLIENT_ID in your environment and restart the dev server.</li>
            <li>Implement the picker using the client libraries and call <code>onVideoSelect(yourFileUrl)</code>.</li>
          </ol>
          <p>For safety, do not commit client secrets to the repo. Use environment variables and server-side token exchange as needed.</p>
        </body>
      </html>
    `;
    const w = window.open('', '_blank', 'noopener,noreferrer,width=700,height=600');
    if (w) {
      w.document.write(helpHtml);
      w.document.close();
    } else {
      alert('Please allow popups to view Drive Picker setup instructions.');
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-2 font-medium">Attach a project video</p>
          <p className="text-sm text-gray-500">File upload, paste a link (YouTube, Vimeo, IPFS), or use Drive Picker (optional)</p>
        </div>
        {ENABLE_DRIVE_PICKER && (
          <button onClick={openDrivePickerHelp} title="Drive Picker setup" className="flex items-center space-x-2 text-sm text-blue-600">
            <InformationCircleIcon className="w-5 h-5" />
            <span>Drive Picker</span>
          </button>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-dashed border-2 border-secondary-300 p-4 rounded text-center bg-white"
      >
        <input ref={fileRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload Video File
        </button>
        <div className="mt-2 text-sm text-gray-500">or drag & drop a video file here</div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">or paste a link</span>
        <input
          type="text"
          placeholder="Paste video URL (YouTube, Vimeo, IPFS, etc.)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="flex-1 px-3 py-2 border rounded bg-white"
        />
        <button onClick={handleUseLink} className="px-3 py-2 bg-green-600 text-white rounded">Use Link</button>
      </div>

      {selectedName && (
        <div className="text-sm text-gray-700">Selected file: <span className="font-medium">{selectedName}</span></div>
      )}

      {previewUrl && (
        <div className="mt-2">
          <video src={previewUrl} controls className="w-full rounded-md max-h-60" />
        </div>
      )}

      <div className="text-xs text-gray-500">Tip: For Google Drive integration, enable the Drive Picker API and add OAuth flow. This component provides a safe fallback and preview.</div>
    </div>
  );
};

export default ProjectVideoDriveUpload;
