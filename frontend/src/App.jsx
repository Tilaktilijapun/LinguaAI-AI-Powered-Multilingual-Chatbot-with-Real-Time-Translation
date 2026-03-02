import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'Nepali' },
  { value: 'hi', label: 'Hindi' }
];

const localeByLanguage = {
  en: 'en-US',
  ne: 'ne-NP',
  hi: 'hi-IN'
};

export default function App() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState('en');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef(null);

  const supportsSpeechRecognition = useMemo(
    () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    []
  );

  const supportsSpeechSynthesis = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    []
  );

  const loadHistory = async () => {
    const response = await fetch(`${API_BASE}/api/history`);
    const data = await response.json();
    setHistory(data.history || []);
  };

  useEffect(() => {
    loadHistory().catch(() => {
      setHistory([]);
    });
  }, []);

  useEffect(() => {
    if (!supportsSpeechRecognition) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setMessage((prev) => `${prev} ${transcript}`.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [supportsSpeechRecognition]);

  const speakReply = (text) => {
    if (!voiceEnabled || !supportsSpeechSynthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeByLanguage[language] || 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current || isListening) return;
    recognitionRef.current.lang = localeByLanguage[language] || 'en-US';
    recognitionRef.current.start();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, preferredLanguage: language })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      const newRecord = {
        userMessage: message,
        sourceLanguage: data.sourceLanguage,
        normalizedMessage: data.translatedToEnglish,
        assistantReply: data.assistantReply,
        assistantReplyInEnglish: data.assistantReplyInEnglish,
        createdAt: new Date().toISOString()
      };

      setHistory((prev) => [newRecord, ...prev]);
      speakReply(data.assistantReply);
      setMessage('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="chat-card">
        <h1>LinguaAI Multilingual Chatbot</h1>
        <p>Chat in English, Nepali, or Hindi with translation + AI response. Voice input/output supported in modern browsers.</p>

        <form onSubmit={sendMessage} className="chat-form">
          <div className="controls-row">
            <label>
              Language
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="voice-toggle">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(event) => setVoiceEnabled(event.target.checked)}
                disabled={!supportsSpeechSynthesis}
              />
              Voice Reply
            </label>
          </div>

          <label>
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Type your message here..."
            />
          </label>

          <div className="button-row">
            <button type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Message'}</button>
            <button
              type="button"
              className="secondary-btn"
              onClick={startVoiceInput}
              disabled={!supportsSpeechRecognition || isListening || isLoading}
              title={supportsSpeechRecognition ? 'Use microphone' : 'Speech recognition not supported in this browser'}
            >
              {isListening ? 'Listening…' : '🎙️ Speak'}
            </button>
          </div>
        </form>

        <div className="history">
          <h2>Recent Chats</h2>
          {history.length === 0 && <p className="placeholder">No messages yet.</p>}
          {history.map((chat, index) => (
            <article key={`${chat.createdAt}-${index}`} className="history-item">
              <p><strong>User ({chat.sourceLanguage}):</strong> {chat.userMessage}</p>
              <p><strong>English:</strong> {chat.normalizedMessage}</p>
              <p><strong>Assistant:</strong> {chat.assistantReply}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
