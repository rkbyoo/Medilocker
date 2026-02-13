import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { toast } from 'sonner';

interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  initialText?: string;
  fieldName?: string;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialText = '',
  fieldName = 'Diagnosis & Findings'
}) => {
  const [transcript, setTranscript] = useState(initialText);
  
  const {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onResult: (text, isInterim) => {
      if (!isInterim) {
        setTranscript(prev => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + separator + text;
        });
      }
    },
    onStart: () => {
      toast.success('🎤 Listening... Start speaking');
    },
    onEnd: () => {
      toast.info('✅ Voice input stopped');
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen && isSupported) {
      const timer = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isSupported, startListening]);

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
    }
  }, [isOpen, isListening, stopListening]);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    toast.success('Copied to clipboard');
  };

  const handleClear = () => {
    setTranscript('');
    toast.info('Transcription cleared');
  };

  const handleInsert = () => {
    onInsert(transcript);
    onClose();
  };

  const handleCancel = () => {
    stopListening();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MaterialIcon name="graphic_eq" size={20} className="text-[#1246e2]" />
                Voice Dictation - {fieldName}
              </h3>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            {/* Voice Visualization */}
            <div className="p-8 flex flex-col items-center justify-center border-b border-gray-100">
              <div className="relative size-16 flex items-center justify-center mb-6">
                {/* Pulse Ring */}
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-blue-100 rounded-full"
                      animate={{
                        scale: [1, 2.5],
                        opacity: [0.5, 0]
                      }}
                      transition={{
                        duration: 2,
                        ease: [0.215, 0.61, 0.355, 1],
                        repeat: Infinity
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-blue-200 rounded-full"
                      animate={{
                        scale: [1, 2],
                        opacity: [0.3, 0]
                      }}
                      transition={{
                        duration: 2,
                        ease: [0.215, 0.61, 0.355, 1],
                        repeat: Infinity,
                        delay: 0.5
                      }}
                    />
                  </>
                )}
                
                {/* Mic Button */}
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  disabled={!isSupported}
                  className={`relative size-14 rounded-full flex items-center justify-center shadow-lg z-10 transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-red-200' 
                      : 'bg-[#1246e2] text-white shadow-blue-200 hover:bg-blue-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MaterialIcon name={isListening ? 'mic_off' : 'mic'} size={24} />
                </motion.button>
              </div>

              <p className="text-sm font-semibold text-slate-700 mb-1">
                {isListening ? 'Listening...' : isSupported ? 'Tap to start' : 'Not supported'}
              </p>
              <p className="text-xs text-slate-400 mb-6">
                {isSupported ? 'Speak clearly into your microphone' : 'Speech recognition not available'}
              </p>

              {/* Waveform Animation */}
              {isListening && (
                <div className="flex items-center justify-center gap-1 h-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-blue-500 rounded-full"
                      animate={{
                        height: ['10px', '25px', '10px']
                      }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.4,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Transcription Area */}
            <div className="p-6 bg-gray-50/30 flex-1 overflow-y-auto">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Live Transcription
              </label>
              <div className="relative">
                <Textarea
                  value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transcription will appear here..."
                  className="w-full h-40 text-[13px] leading-relaxed text-slate-700 bg-white resize-none pr-16"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-[#1246e2] transition-colors p-1"
                    title="Copy"
                  >
                    <MaterialIcon name="content_copy" size={16} />
                  </button>
                  <button
                    onClick={handleClear}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Clear"
                  >
                    <MaterialIcon name="delete_outline" size={16} />
                  </button>
                </div>
              </div>
              
              {/* Interim transcript indicator */}
              {interimTranscript && (
                <p className="text-xs text-slate-400 mt-2 italic">
                  Speaking: "{interimTranscript}"
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-4 py-2 text-slate-600 text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInsert}
                className="px-4 py-2 bg-[#1246e2] text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 flex items-center gap-2"
              >
                <MaterialIcon name="check" size={18} />
                Insert into Consultation
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceDictationModal;
