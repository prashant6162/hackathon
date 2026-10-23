import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { processAvatarFile } from '../../services/imageUtils';
import { useNotifications } from '../../context/NotificationContext';
import {
  Upload,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Check,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

interface ProfilePictureModalProps {
  currentAvatar: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (avatarUrl: string) => void;
}

const PRESET_AVATARS = [
  { id: 'av1', label: 'Maya (Design)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'David (Engineer)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Elena (Musician)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Carlos (Chef)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Priya (Yoga)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Marcus (Photo)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80' },
  { id: 'av7', label: 'Sarah (Admin)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
  { id: 'av8', label: 'Sophia (Languages)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' },
  { id: 'av9', label: 'Alex (Creative)', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { id: 'av10', label: 'Liam (Maker)', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80' },
  { id: 'av11', label: 'Chloe (Artist)', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80' },
  { id: 'av12', label: 'Jordan (Academics)', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80' },
];

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  currentAvatar,
  isOpen,
  onClose,
  onSaveAvatar,
}) => {
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'presets' | 'url'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setSelectedAvatar(currentAvatar);
  }, [currentAvatar, isOpen]);

  // Clean up camera stream when modal closes or switching tabs
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported by your browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Unable to access webcam. Please check browser camera permissions.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video centered square
    const video = videoRef.current;
    const minSide = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minSide) / 2;
    const startY = (video.videoHeight - minSide) / 2;

    ctx.drawImage(video, startX, startY, minSide, minSide, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedAvatar(dataUrl);
    stopCamera();
    setActiveTab('upload');
    showToast('Photo Captured! 📸', 'Your webcam snapshot is ready to save.', 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await processAvatarFile(file);
        setSelectedAvatar(compressed);
        showToast('Image Loaded', 'Photo processed and cropped.', 'info');
      } catch (err: any) {
        showToast('Image Error', err.message || 'Failed to process image.', 'error');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        const compressed = await processAvatarFile(file);
        setSelectedAvatar(compressed);
        showToast('Image Dropped', 'Photo loaded successfully.', 'info');
      } catch (err: any) {
        showToast('Image Error', err.message || 'Failed to process file.', 'error');
      }
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setSelectedAvatar(urlInput.trim());
      setUrlInput('');
      showToast('Image URL Applied', 'Preview updated.', 'info');
    }
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    stopCamera();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Update Profile Picture"
      subtitle="Upload your photo, snap a selfie with your camera, or choose a community avatar."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Current / New Avatar Comparison Preview */}
        <div className="flex items-center justify-center gap-6 py-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={selectedAvatar}
                alt="New Avatar Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-brand-500 shadow-md"
              />
              <span className="absolute bottom-0 right-0 bg-brand-600 text-white p-1 rounded-full shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-2">Active Preview</p>
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {[
            { id: 'upload', label: 'Upload Photo', icon: Upload },
            { id: 'camera', label: 'Take Selfie', icon: Camera },
            { id: 'presets', label: 'Preset Avatars', icon: Sparkles },
            { id: 'url', label: 'Image URL', icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Upload from Device */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Click to browse photo, or drag and drop here
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Supports PNG, JPEG, or WebP. Automatically center-cropped to a square.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Webcam Camera Capture */}
        {activeTab === 'camera' && (
          <div className="space-y-4 text-center">
            {cameraError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="font-bold">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto w-72 h-72 rounded-3xl overflow-hidden bg-black border-4 border-slate-800 shadow-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Circular target overlay guide */}
                  <div className="absolute inset-4 rounded-full border-2 border-white/60 pointer-events-none" />
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Profile Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Curated Preset Avatars */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Select one of our curated high-resolution neighborhood portrait styles:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1">
              {PRESET_AVATARS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`relative p-1 rounded-2xl border transition-all text-center group ${
                    selectedAvatar === av.url
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-14 h-14 rounded-full object-cover mx-auto"
                  />
                  <p className="text-[10px] font-semibold text-slate-700 mt-1 truncate">
                    {av.label.split(' ')[0]}
                  </p>
                  {selectedAvatar === av.url && (
                    <span className="absolute top-1 right-1 bg-brand-600 text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Image URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Paste Direct Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
              >
                Apply URL
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Paste any public avatar URL from Unsplash, Gravatar, or personal hosting.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Picture</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
