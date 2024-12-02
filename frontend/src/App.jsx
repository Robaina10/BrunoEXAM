import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [audio, setAudio] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleUploadFile = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
        formData
      );
      alert(`File uploaded: ${response.data.message}`);
    } catch (error) {
      alert(`Error uploading file: ${error.message}`);
    }
  };

  const handleRecognizeAudio = async () => {
    if (!audio) return alert("Please select an audio file");
    const formData = new FormData();
    formData.append("audio", audio);

    try {
      const response = await axios.post(
        "http://localhost:3000/recognize",
        formData
      );
      setTranscript(response.data.transcript);
    } catch (error) {
      alert(`Error recognizing speech: ${error.message}`);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return alert("Please enter a prompt");
    try {
      const response = await axios.post(
        "http://localhost:3000/generate-image",
        { prompt }
      );
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      alert(`Error generating image: ${error.message}`);
    }
  };

  const handleAskQuestion = async () => {
    if (!question) return alert("Please enter a question");
    try {
      const response = await axios.post("http://localhost:3000/ask", {
        question,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      alert(`Error retrieving answer: ${error.message}`);
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Tu navegador no soporta la API de Reconocimiento de Voz.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        alert(`Error en el reconocimiento: ${event.error}`);
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      alert("Error al iniciar el reconocimiento de voz.");
    }
  };

  return (
    <div className="app">
      <h1>Virtual Assistant</h1>
      <div className="app-container">
        <div className="open">
          <section className="ask">
            <h2>Ask the Assistant</h2>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Ask something"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                style={{ flex: 1 }}
              />
              <div className="buttons">
                <button
                  className="button3"
                  onClick={startListening}
                  style={{ marginLeft: "10px", padding: "5px" }}
                >
                  {isListening ? "Listening..." : "🎙️"}
                </button>
                <button
                  onClick={handleAskQuestion}
                  className="button3"
                  style={{ marginLeft: "10px" }}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </div>
            {answer && <p>Answer: {answer}</p>}
          </section>
          <section className="image">
            <h2>Image Generator</h2>
            <input
              type="text"
              placeholder="Enter a image prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button onClick={handleGenerateImage} className="button3">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Generated"
                style={{ maxWidth: "300px", marginTop: "10px" }}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
