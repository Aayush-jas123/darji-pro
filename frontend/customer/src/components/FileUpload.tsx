'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface FileUploadProps {
    uploadType?: 'design' | 'fabric' | 'measurement' | 'profile';
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    onUploadComplete?: (files: UploadedFile[]) => void;
    onUploadError?: (error: string) => void;
    className?: string;
}

interface UploadedFile {
    filename: string;
    url: string;
    path: string;
    size: number;
    width?: number;
    height?: number;
}

export function FileUpload({
    uploadType = 'design',
    multiple = false,
    maxFiles = 5,
    maxSizeMB = 10,
    onUploadComplete,
    onUploadError,
    className = ''
}: FileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return false;
        }

        // Check file size
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const fileArray = Array.from(newFiles);

        // Check max files
        if (!multiple && fileArray.length > 1) {
            setError('Only one file allowed');
            return;
        }

        if (files.length + fileArray.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate each file
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) return;

        // Create previews
        const newPreviews: string[] = [];
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length) {
                    setPreviews([...previews, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setFiles([...files, ...validFiles]);
        setError(null);
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to upload files');
            }

            const formData = new FormData();

            if (multiple) {
                files.forEach(file => {
                    formData.append('files', file);
                });

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || ''}/api/uploads/${uploadType}/multiple`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                setUploadedFiles(data.successful || []);
                onUploadComplete?.(data.successful || []);
            } else {
                formData.append('file', files[0]);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || ''}/api/uploads/${uploadType}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                const uploadedFile: UploadedFile = {
                    filename: data.filename,
                    url: data.url,
                    path: data.path,
                    size: data.size,
                    width: data.width,
                    height: data.height
                };
                setUploadedFiles([uploadedFile]);
                onUploadComplete?.([uploadedFile]);
            }

            // Clear files after successful upload
            setFiles([]);
            setPreviews([]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            onUploadError?.(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Upload className="w-8 h-8 text-gray-400" />
                    </div>

                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            Drop files here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max {maxSizeMB}MB each
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Select Files
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                {files[index].name}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && (
                <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                >
                    {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
                </Button>
            )}

            {/* Success Message */}
            {uploadedFiles.length > 0 && !uploading && (
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                        Successfully uploaded {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
}
