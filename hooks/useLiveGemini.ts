import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../services/audioUtils';
import { LiveStatus } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const useLiveGemini = () => {
  const [status, setStatus] = useState<LiveStatus>('disconnected');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // For visualizer

  // Audio Contexts
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // Type is loosely typed as 'any' due to SDK dynamic nature or complex Session type
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize AI client lazily or when needed to avoid immediate crashes if process.env is missing at module load
  const ai = useMemo(() => {
    const apiKey = process.env.API_KEY;
    // Fallback to avoid crash during init if key is missing, connection will verify it later
    return new GoogleGenAI({ apiKey: apiKey || 'placeholder' });
  }, []);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
      console.error("Cannot connect: API_KEY missing");
      setStatus('error');
      return;
    }
    
    try {
      setStatus('connecting');

      // Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `
            Você é um consultor especialista em notebooks, muito simpático e paciente.
            Seu objetivo é entender o perfil do usuário através de perguntas sobre o cotidiano dele, evitando jargões técnicos.
            
            1. NÃO pergunte "Quanto de memória RAM você quer?". 
               PERGUNTE "Você costuma abrir muitas janelas ao mesmo tempo ou usa programas pesados?"
            
            2. NÃO pergunte "Qual processador você prefere?".
               PERGUNTE "O notebook é mais para estudos básicos, trabalho de escritório ou edições de vídeo?"

            3. Seja breve e conversacional. Fale como um amigo que entende de tecnologia.
            4. Fale APENAS em Português do Brasil.
          `,
        },
        callbacks: {
          onopen: () => {
            console.log('Live Session Opened');
            setStatus('connected');

            // Setup Input Processing
            if (!inputContextRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (isMuted) return; // Simple mute implementation
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Visualizer data
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolumeLevel(Math.sqrt(sum/inputData.length));

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Model Audio
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
               const ctx = outputContextRef.current;
               // Sync Playback
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 base64ToUint8Array(audioData),
                 ctx
               );
               
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(ctx.destination);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                console.log('Interrupted');
                nextStartTimeRef.current = 0;
                // Ideally stop all currently playing nodes (requires tracking them)
            }
          },
          onclose: () => {
            console.log('Live Session Closed');
            setStatus('disconnected');
          },
          onerror: (err) => {
            console.error('Live Session Error', err);
            setStatus('error');
          }
        }
      });
      
      sessionRef.current = sessionPromise; // Store promise to close later if needed (though SDK doesn't expose close on promise directly usually, session obj does)

    } catch (error) {
      console.error("Failed to connect live session", error);
      setStatus('error');
    }
  }, [isMuted, ai]);

  const disconnect = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) {
      await inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      await outputContextRef.current.close();
      outputContextRef.current = null;
    }
    // Note: The SDK doc says session.close() but we have a promise.
    // We assume the effect cleanup or user action triggers this.
    // If we had the session object resolved, we would call .close().
    // For now, closing the socket happens via context cleanup mostly or reload.
    setStatus('disconnected');
    setVolumeLevel(0);
  }, []);

  const toggleMute = () => setIsMuted(!isMuted);

  return {
    status,
    connect,
    disconnect,
    isMuted,
    toggleMute,
    volumeLevel
  };
};