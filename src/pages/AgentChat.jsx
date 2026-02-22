import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container, Button, Card, Input, Avatar } from '../components/design-system';
import { Send, ArrowLeft, Settings, AlertCircle, Mic, Paperclip, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { getAgentById } from '../data/agents';

// ── Persistence & Analytics ──────────────────────────────────────────────────
const CHAT_KEY = (id) => `sf_chat_${id}`;
const ANALYTICS_KEY = 'sf_analytics';

/** Append one analytics event; keep max 500 events total */
const trackEvent = (type, data = {}) => {
  try {
    const events = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    events.push({ type, ts: Date.now(), ...data });
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (_) {}
};

/** Build the agent greeting message object */
const buildGreeting = (ag) => ({
  id: 1,
  sender: 'agent',
  text: `สวัสดีค่ะ! ฉันคือ ${ag.name} 🎯 ${ag.emoji}\n\n${ag.description}\n\nข้อมูลว่าฉันสามารถช่วยเรื่องอะไรได้ บอกมาได้เลยค่ะ`,
  timestamp: new Date(),
  confidence: 100,
});

// ── Component ────────────────────────────────────────────────────────────────
export const AgentChat = ({ agentId, onBack, masterContext }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agent, setAgent] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [draftRestored, setDraftRestored] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const sessionStartRef = useRef(Date.now());
  // Guards save effects from writing old messages under a new agentId
  const activeAgentRef = useRef(agentId);

  // ── Init: load history, draft, setup speech ─────────────────────────────
  useEffect(() => {
    const selectedAgent = getAgentById(agentId);
    setAgent(selectedAgent);
    activeAgentRef.current = agentId;
    sessionStartRef.current = Date.now();
    setDraftRestored(false);

    // Stop any active speech from previous agent
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }

    // Analytics: agent opened
    trackEvent('agent_opened', {
      agentId,
      cluster: selectedAgent?.cluster,
    });

    // Restore chat history + draft from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_KEY(agentId)) || 'null');
      if (saved?.messages?.length > 0) {
        // Rehydrate Date objects
        setMessages(saved.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
        if (saved.draft) {
          setInputValue(saved.draft);
          setDraftRestored(true);
        } else {
          setInputValue('');
        }
      } else if (selectedAgent) {
        setMessages([buildGreeting(selectedAgent)]);
        setInputValue('');
      }
    } catch (_) {
      if (selectedAgent) setMessages([buildGreeting(selectedAgent)]);
    }

    // Setup Web Speech API (th-TH)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'th-TH';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) setInputValue(transcript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech error: ${event.error}`);
      };
      recognitionRef.current = recognition;
    }

    // Track session duration when agent changes or component unmounts
    return () => {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      trackEvent('session_end', { agentId, duration_s: duration });
    };
  }, [agentId]);

  // ── Persist messages to localStorage ─────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0 || activeAgentRef.current !== agentId) return;
    try {
      const current = JSON.parse(localStorage.getItem(CHAT_KEY(agentId)) || '{}');
      localStorage.setItem(
        CHAT_KEY(agentId),
        JSON.stringify({ ...current, messages, lastUpdated: Date.now() })
      );
    } catch (_) {}
  }, [messages, agentId]);

  // ── Persist draft to localStorage ─────────────────────────────────────────
  useEffect(() => {
    if (activeAgentRef.current !== agentId) return;
    try {
      const current = JSON.parse(localStorage.getItem(CHAT_KEY(agentId)) || '{}');
      localStorage.setItem(CHAT_KEY(agentId), JSON.stringify({ ...current, draft: inputValue }));
    } catch (_) {}
  }, [inputValue, agentId]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Speech toggle ─────────────────────────────────────────────────────────
  const handleSpeechToggle = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputValue('');
      setDraftRestored(false);
      recognitionRef.current.start();
    }
  };

  // ── File attach ───────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large (max 10MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result,
        };
        setAttachments((prev) => [...prev, fileData]);
        if (file.type.startsWith('image/')) {
          setPreviewUrls((prev) => ({ ...prev, [file.name]: event.target?.result }));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (fileName) => {
    setAttachments((prev) => prev.filter((f) => f.name !== fileName));
    setPreviewUrls((prev) => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
  };

  // ── Clear chat history ────────────────────────────────────────────────────
  const handleClearChat = () => {
    if (!window.confirm('ล้างประวัติการสนทนานี้?')) return;
    localStorage.removeItem(CHAT_KEY(agentId));
    setMessages([buildGreeting(agent)]);
    setInputValue('');
    setDraftRestored(false);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputValue.trim() && attachments.length === 0) || !masterContext) return;
    setError(null);
    setDraftRestored(false);

    // Analytics: what matters for later analysis
    trackEvent('message_sent', {
      agentId,
      cluster: agent?.cluster,
      msg_len: inputValue.length,
      has_image: attachments.some((a) => a.type.startsWith('image/')),
      has_file: attachments.some((a) => !a.type.startsWith('image/')),
      used_speech: isListening,
      hour: new Date().getHours(),
      day: new Date().getDay(), // 0=Sun … 6=Sat
    });

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
      attachments: attachments.map((a) => ({ name: a.name, type: a.type, size: a.size })),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setPreviewUrls({});

    setIsLoading(true);
    try {
      const response = await aiService.processMessage({
        userInput: inputValue || `[${attachments.map((a) => a.name).join(', ')} uploaded]`,
        context: masterContext,
        forceAgent: agentId,
        attachments,
      });

      const agentMessage = {
        id: messages.length + 2,
        sender: 'agent',
        text: response.content,
        timestamp: new Date(),
        rawOutput: response.rawOutput,
        confidence: response.confidence,
        agentName: response.agentName,
        factCheckResult: response.factCheckResult,
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error('Error calling AI Service:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: messages.length + 2,
          sender: 'agent',
          text: `⚠️ ขออภัยค่ะ เกิดข้อผิดพลาด: ${err.message}`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Animation variants ────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // ── No brand context guard ────────────────────────────────────────────────
  if (!masterContext) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <Container size="lg">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[#5E9BEB] hover:text-[#4A7BC9] font-semibold font-sarabun"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>
          </Container>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2 font-sarabun">
                โปรดเซ็ตอัปข้อมูลแบรนด์ก่อน
              </h2>
              <p className="text-gray-600 font-sarabun mb-4">
                คลิก "Setup Brand" ที่ header เพื่อตั้งค่าข้อมูลแบรนด์ของคุณ
              </p>
              <Button onClick={onBack}>กลับไป</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <Container size="lg">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[#5E9BEB] hover:text-[#4A7BC9] font-semibold font-sarabun"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-gray-900 font-sarabun">
                {agent ? `${agent.emoji} ${agent.name}` : 'Social Media Agent'}
              </h1>
              <p className="text-xs text-gray-500 font-sarabun">
                {isLoading ? '⏳ กำลังคิด...' : '✓ พร้อมช่วยเหลือ'}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {/* Clear chat history */}
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="ล้างประวัติการสนทนา"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="border-b border-red-200 bg-red-50">
          <Container size="lg">
            <div className="flex items-center gap-3 py-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700 font-sarabun">{error}</p>
            </div>
          </Container>
        </div>
      )}

      {/* Draft restored notice */}
      {draftRestored && (
        <div className="border-b border-amber-200 bg-amber-50">
          <Container size="lg">
            <p className="text-xs text-amber-700 py-2 font-sarabun">
              ✏️ คืน draft ที่พิมพ์ค้างไว้ — แก้ไขหรือส่งได้เลยค่ะ
            </p>
          </Container>
        </div>
      )}

      {/* Messages */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <Container size="lg">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {message.sender === 'agent' && !message.isError && (
                    <Avatar fallback={agent?.emoji || 'A'} size="sm" className="flex-shrink-0" />
                  )}
                  {message.isError && (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.isError
                        ? 'bg-red-100 text-red-900 rounded-bl-none'
                        : message.sender === 'user'
                        ? 'bg-[#5E9BEB] text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="font-sarabun whitespace-pre-wrap break-words">{message.text}</p>

                    {/* Attachment chips */}
                    {message.attachments?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.attachments.map((a) => (
                          <span
                            key={a.name}
                            className="text-xs bg-white/30 px-2 py-1 rounded-full"
                          >
                            {a.type.startsWith('image/') ? '🖼️' : '📎'} {a.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-xs mt-2 flex flex-wrap gap-3 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      <span>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.confidence && (
                        <span title="Confidence score">
                          🎯 {(message.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      {message.factCheckResult?.valid === false && (
                        <span className="text-yellow-600">⚠️ Needs review</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div variants={messageVariants} className="flex justify-start">
                <div className="flex gap-3">
                  <Avatar fallback={agent?.emoji || 'A'} size="sm" />
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.div
                          key={delay}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Container>
      </motion.div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white">
        <Container size="lg">
          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="py-3 border-b border-gray-100">
              <div className="flex flex-wrap gap-3">
                {attachments.map((attachment) => (
                  <div key={attachment.name} className="relative group">
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                      {attachment.type.startsWith('image/') ? (
                        <>
                          <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="w-16 h-16">
                            <img
                              src={previewUrls[attachment.name]}
                              alt={attachment.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <Paperclip className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-sarabun max-w-[120px] truncate">
                            {attachment.name}
                          </span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.name)}
                        className="ml-1 p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="py-4 flex gap-3">
            {/* Speech button */}
            {speechSupported && (
              <motion.button
                type="button"
                onClick={handleSpeechToggle}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileTap={{ scale: 0.95 }}
                title={isListening ? 'หยุดฟัง' : 'พูดเพื่อพิมพ์ (ภาษาไทย)'}
              >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </motion.button>
            )}

            {/* Attach button */}
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all flex-shrink-0"
              whileTap={{ scale: 0.95 }}
              title="แนบรูปภาพหรือไฟล์"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx"
            />

            <Input
              placeholder={isListening ? '🎤 กำลังฟัง...' : 'พิมพ์ข้อความ หรือกด 🎤 เพื่อพูด'}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setDraftRestored(false);
              }}
              disabled={isLoading}
              className="flex-1"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
              className="flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </Container>
      </div>
    </div>
  );
};

export default AgentChat;
