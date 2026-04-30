const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta index.html
app.use(express.static(__dirname));

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para chamar Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { mensagem, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key não fornecida' });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Você é um assistente de atendimento ao cliente para a loja de cosméticos "Stephany's Cosméticos". Seja amigável, prestativo e conciso. Responda em português brasileiro. Foque em ajudar com dúvidas sobre produtos, pedidos, preços e envios.\n\nCliente: ${mensagem}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error?.message || 'Erro ao conectar com Gemini'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📂 Arquivos sendo servidos de: ${__dirname}`);
});
