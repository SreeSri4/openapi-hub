import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { parseConfigFile } from '../services/fileParser';

interface FileUploadAreaProps {
  onUploadSuccess?: () => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setTenants = useAppState((state) => state.setTenants);

  const handleFile = (file: File) => {
    if (file.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const config = parseConfigFile(content);
        setTenants(config.tenants);
        setError(null);
        onUploadSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to parse file'
        );
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".json"
        onChange={handleChange}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="cursor-pointer block">
        <p className="text-lg font-semibold text-gray-700">
          📄 Drag & drop your JSON config file here
        </p>
        <p className="text-sm text-gray-500 mt-2">or click to select</p>
      </label>
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  );
};
