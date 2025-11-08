import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Mic, MicOff } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useImagesStore } from '../../store/useImagesStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import ReactMarkdown from 'react-markdown';
import { pipeline } from '@huggingface/transformers';

const ChatInterface = () => {
  const { messages, isLoading, sendMessage } = useChatStore();
  const { images } = useImagesStore();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriber = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Whisper model on first use
  const loadModel = async () => {
    if (transcriber.current === null) {
      setIsModelLoading(true);
      try {
        // Load Whisper tiny model (fast and efficient for browser)
        transcriber.current = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-tiny.en',
          { quantized: true }
        );
        console.log('Whisper model loaded');
      } catch (error) {
        console.error('Error loading Whisper model:', error);
        alert('Failed to load speech recognition model. Please try again.');
      } finally {
        setIsModelLoading(false);
      }
    }
  };

  const startRecording = async () => {
    try {
      // Load model if not loaded
      await loadModel();
      if (!transcriber.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        // Transcribe audio using browser-based Whisper
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    try {
      // Convert blob to audio buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000 // Whisper expects 16kHz
      });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Resample to 16kHz if needed and get mono audio data
      let audioData = audioBuffer.getChannelData(0);

      // If sample rate is not 16kHz, we need to resample
      if (audioBuffer.sampleRate !== 16000) {
        const offlineContext = new OfflineAudioContext(
          1, // mono
          audioBuffer.duration * 16000,
          16000
        );
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start(0);
        const resampledBuffer = await offlineContext.startRendering();
        audioData = resampledBuffer.getChannelData(0);
      }

      // Ensure it's a Float32Array
      const float32Data = new Float32Array(audioData);

      // Transcribe using Whisper model
      const result = await transcriber.current(float32Data);

      setInput(result.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again or type your message.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  // Function to get image data by ID
  const getImageById = (imageId) => {
    return images.find(img => img.id === imageId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              AI Assistant Ready
            </h3>
            <p className="text-white/60 max-w-md">
              Ask me about your images, request help finding photos, or get assistance
              with tasks like creating newsletters.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}

                <Card
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-white/10'
                  }`}
                >
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  {/* Display image previews if suggested */}
                  {message.suggestedImages && message.suggestedImages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="grid grid-cols-2 gap-3">
                        {message.suggestedImages.map((imageId) => {
                          const image = getImageById(imageId);
                          if (!image) return null;

                          return (
                            <div key={imageId} className="group relative rounded-lg overflow-hidden aspect-video bg-black/20">
                              <img
                                src={image.file_path}
                                alt={image.filename}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8">
                                <p className="text-xs text-white truncate font-medium">{image.filename}</p>
                                {image.tags && image.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1.5 flex-wrap">
                                    {image.tags.slice(0, 2).map((tag) => (
                                      <span
                                        key={tag.id}
                                        className="text-xs bg-primary/30 text-primary px-2 py-0.5 rounded-full"
                                      >
                                        {tag.tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <Card className="bg-white/10">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-white/20 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isModelLoading
                ? "Loading speech model..."
                : isRecording
                ? "Recording..."
                : isTranscribing
                ? "Transcribing..."
                : "Ask me anything about your images..."
            }
            disabled={isLoading || isRecording || isTranscribing || isModelLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant={isRecording ? "default" : "outline"}
            onClick={toggleRecording}
            disabled={isLoading || isTranscribing || isModelLoading}
            className={isRecording ? "animate-pulse bg-red-600 hover:bg-red-700" : ""}
          >
            {isModelLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
          <Button type="submit" disabled={isLoading || !input.trim() || isRecording || isTranscribing || isModelLoading}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
