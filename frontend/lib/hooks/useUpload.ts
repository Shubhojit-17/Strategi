import { useState, useCallback } from 'react';

interface FileUploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  cid?: string;
}

interface UploadResponse {
  cid: string;
  filename: string;
  size: number;
  content_type: string;
}

interface UseUploadReturn {
  files: FileUploadState[];
  overallStatus: 'idle' | 'uploading' | 'success' | 'error';
  overallProgress: number;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  uploadFiles: () => Promise<void>;
  clearFiles: () => void;
  retryFailed: () => Promise<void>;
}

export const useUpload = (): UseUploadReturn => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Add files to upload queue
  const addFiles = useCallback((newFiles: File[]) => {
    const fileStates: FileUploadState[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...fileStates]);
  }, []);

  // Remove a file from queue
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setOverallStatus('idle');
  }, []);

  // Upload single file
  const uploadSingleFile = async (
    file: File,
    index: number,
    onProgress: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Get user address from localStorage or wallet state
    const userAddress = localStorage.getItem('wallet_address');
    if (!userAddress) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }
    formData.append('user_address', userAddress);

    // Get auth token from localStorage (if using token-based auth)
    const token = localStorage.getItem('auth_token');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      // Success
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      // Error
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      // Timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('POST', 'http://localhost:8000/documents/upload');
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.timeout = 60000; // 60 second timeout
      xhr.send(formData);
    });
  };

  // Upload all pending files
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      return;
    }

    setOverallStatus('uploading');

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const fileState = files[i];
      
      if (fileState.status !== 'pending') {
        continue;
      }

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        const response = await uploadSingleFile(
          fileState.file,
          i,
          (progress) => {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress } : f
              )
            );
          }
        );

        // Update to success
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'success' as const,
                  progress: 100,
                  cid: response.cid,
                }
              : f
          )
        );
      } catch (error) {
        // Update to error
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        );
      }
    }

    // Determine overall status
    const allSuccess = files.every((f) => f.status === 'success');
    const hasErrors = files.some((f) => f.status === 'error');

    if (allSuccess) {
      setOverallStatus('success');
    } else if (hasErrors) {
      setOverallStatus('error');
    } else {
      setOverallStatus('idle');
    }
  }, [files]);

  // Retry failed uploads
  const retryFailed = useCallback(async () => {
    // Reset failed files to pending
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'error'
          ? { ...f, status: 'pending', progress: 0, error: undefined }
          : f
      )
    );

    // Upload again
    await uploadFiles();
  }, [uploadFiles]);

  // Calculate overall progress
  const overallProgress =
    files.length > 0
      ? files.reduce((sum, f) => sum + f.progress, 0) / files.length
      : 0;

  return {
    files,
    overallStatus,
    overallProgress,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    retryFailed,
  };
};
