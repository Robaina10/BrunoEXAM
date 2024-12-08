import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "@mui/material/Button";

function App() {
  // Estado para manejar diferentes datos del asistente
  const [inputValue, setInputValue] = useState(""); // Almacena el texto ingresado o archivo seleccionado
  const [uploadedImage, setUploadedImage] = useState(""); // URL de imagen subida
  const [imageUrl, setImageUrl] = useState(""); // URL de imagen generada
  const [answer, setAnswer] = useState(""); // Respuesta del asistente
  const [isListening, setIsListening] = useState(false); // Indica si el reconocimiento de voz está activo
  const [isLoading, setIsLoading] = useState(false); // Indica si se está procesando una solicitud
  const [isAssistantOpen, setIsAssistantOpen] = useState(false); // Estado que controla si el asistente está abierto

  useEffect(() => {
    // Efecto para iniciar el reconocimiento de voz continuo con la palabra clave "HOLA"
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Tu navegador no soporta la API de Reconocimiento de Voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES"; // Configura el idioma del reconocimiento
    recognition.interimResults = false; // Solo obtiene resultados finales
    recognition.continuous = true; // Permite que escuche continuamente

    // Evento que se dispara cuando se detecta un resultado de voz
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      if (transcript === "hola") {
        setIsAssistantOpen(true); // Abre el asistente si escucha "HOLA"
        readAloud("Hola, ¿en qué puedo ayudarte?"); // Respuesta de bienvenida
      }
    };

    // Manejo de errores en el reconocimiento
    recognition.onerror = (event) => {
      console.error("Error en el reconocimiento de voz:", event.error);
    };

    recognition.start(); // Inicia el reconocimiento continuo

    return () => recognition.abort(); // Detiene el reconocimiento al desmontar el componente
  }, []);

  // Procesa la entrada del usuario (texto o archivo)
  const handleProcessInput = async () => {
    if (!inputValue) {
      alert("Por favor, ingresa texto o selecciona un archivo.");
      return;
    }

    setIsLoading(true); // Indica que la solicitud está en curso

    if (typeof inputValue === "object" && inputValue instanceof File) {
      // Procesa un archivo de imagen
      const formData = new FormData();
      formData.append("image", inputValue);

      try {
        const response = await axios.post("http://localhost:3000/upload-image", formData);
        setUploadedImage(response.data.imageUrl); // Guarda la URL de la imagen subida
        alert("Imagen subida exitosamente.");
        readAloud("Imagen subida exitosamente.");
      } catch (error) {
        const errorMessage = `Error subiendo la imagen: ${error.message}`;
        alert(errorMessage);
        readAloud(errorMessage);
      } finally {
        setIsLoading(false); // Finaliza la carga
      }
      return;
    }

    // Procesa texto ingresado
    try {
      if (inputValue.trim().endsWith("?")) {
        // Si es una pregunta, obtiene una respuesta del servidor
        const response = await axios.post("http://localhost:3000/ask", { question: inputValue });
        setAnswer(response.data.answer); // Almacena la respuesta
        setImageUrl(""); // Limpia la URL de imagen generada
        readAloud(response.data.answer); // Lee la respuesta en voz alta
      } else {
        // Si no es una pregunta, genera una imagen basada en el texto
        const response = await axios.post("http://localhost:3000/generate-image", { prompt: inputValue });
        setImageUrl(response.data.imageUrl); // Almacena la URL de la imagen generada
        setAnswer(""); // Limpia la respuesta de texto
        readAloud("Imagen generada con éxito.");
      }
    } catch (error) {
      const errorMessage = `Error procesando la solicitud: ${error.message}`;
      alert(errorMessage);
      readAloud(errorMessage);
    } finally {
      setIsLoading(false); // Finaliza la carga
    }
  };

  // Maneja el cambio de archivo en el input de tipo file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputValue(file); // Guarda el archivo en el estado
    }
  };

  // Inicia el reconocimiento de voz para capturar texto
  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Tu navegador no soporta la API de Reconocimiento de Voz.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES"; // Configura el idioma
      recognition.interimResults = false; // Solo resultados finales

      recognition.onstart = () => {
        setIsListening(true); // Indica que está escuchando
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript); // Guarda el texto reconocido
        setIsListening(false); // Detiene el estado de escucha
      };

      recognition.onend = () => {
        setIsListening(false); // Finaliza la escucha
      };

      recognition.onerror = (event) => {
        alert(`Error en el reconocimiento: ${event.error}`);
        setIsListening(false);
      };

      recognition.start(); // Inicia el reconocimiento de voz
    } catch (error) {
      alert("Error al iniciar el reconocimiento de voz.");
    }
  };

  // Reproduce texto en voz alta usando la API SpeechSynthesis
  const readAloud = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text); // Crea un objeto para sintetizar voz
    utterance.lang = "es-ES"; // Configura el idioma
    window.speechSynthesis.speak(utterance); // Inicia la reproducción de voz
  };

  return (
    <div className="assistant-wrapper">
      {isAssistantOpen ? ( // Muestra el asistente si está activo
        <div>
          <h1>Asistente Virtual</h1>
          <div className="assistant-container">
            <div className="assistant-interaction">
              <h2>Pregunta algo</h2>
              <div className="assistant-inputs">
                <input
                  type="text"
                  placeholder="Escribe una pregunta o un prompt"
                  value={typeof inputValue === "string" ? inputValue : ""}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="assistant-text-input"
                />
                <Button
                  variant="contained"
                  color={isListening ? "error" : "primary"}
                  onClick={startListening}
                  className="ml-2"
                >
                  {isListening ? "Escuchando..." : "🎙️"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="assistant-file-input"
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleProcessInput}
                  className="ml-2"
                >
                  Enviar
                </Button>
              </div>
            </div>
            <div className="assistant-responses">
              {isLoading && <p className="loading-indicator">Cargando respuesta...</p>} {/* Indicador de carga */}
              {uploadedImage && (
                <div className="assistant-uploaded-image">
                  <h3>Imagen Subida:</h3>
                  <img src={uploadedImage} alt="Uploaded" /> {/* Muestra la imagen subida */}
                </div>
              )}
              {imageUrl && (
                <div className="assistant-generated-image">
                  <h3>Imagen Generada:</h3>
                  <img src={imageUrl} alt="Generated" /> {/* Muestra la imagen generada */}
                </div>
              )}
              {answer && (
                <p className="assistant-answer">
                  <strong>Respuesta:</strong> {answer} {/* Muestra la respuesta del asistente */}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Di "Hola" para activar al asistente.</p> // Mensaje inicial para activar el asistente
      )}
    </div>
  );
}

export default App;

