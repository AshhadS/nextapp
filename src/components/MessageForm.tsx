'use client';
import { useRef, useState } from 'react';
import { LoadingButton } from './LoadingButton';
import { api } from '@/lib/api';

interface MessageFormProps {
  user: any;
  onUpdateTyping: (isTyping: boolean) => Promise<void>;
}

export const MessageForm = ({ user, onUpdateTyping }: MessageFormProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const { url } = await api.upload.image(file);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !user || isSending) return;

    setIsSending(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      await api.messages.send(newMessage.trim(), imageUrl);
      
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={sendMessage} className="max-w-7xl mx-auto space-y-4">
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Selected image"
            className="rounded-lg max-h-[200px] w-auto"
          />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            onUpdateTyping(true);
          }}
          placeholder="Type your message..."
          disabled={isSending}
          className={`flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isSending ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          ref={fileInputRef}
          disabled={isSending}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`${
            isSending 
              ? 'bg-gray-200 cursor-not-allowed'
              : 'cursor-pointer bg-gray-100 hover:bg-gray-200'
          } text-gray-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
        <LoadingButton
          isLoading={isSending}
          text="Send"
          loadingText="Sending..."
          disabled={(!newMessage.trim() && !selectedImage) || !user}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </form>
  );
};
