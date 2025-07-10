const express = require('express');
const axios = require('axios');
const { PassThrough } = require('stream');

const app = express();
app.use(express.json({ limit: '10mb' }));

const OPENAI_BASE = 'http://localhost:4000/openai/v1';

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const axiosPost = async (url, data, opts) => {
  console.log(`Proxy POST to: ${url}`);
  if (data) console.log('Payload:', JSON.stringify(data));
  return axios.post(url, data, opts);
};
const axiosGet = async (url, opts) => {
  console.log(`Proxy GET to: ${url}`);
  return axios.get(url, opts);
};

app.post('/api/chat', async (req, res) => {
  try {
    const { model, messages, stream, ...rest } = req.body;
    const openaiReq = {
      model: model || 'vscode-lm-proxy',
      messages,
      stream: !!stream,
      ...rest
    };
    const openaiUrl = `${OPENAI_BASE}/chat/completions`;
    if (stream) {
      const response = await axiosPost(openaiUrl, openaiReq, {
        responseType: 'stream',
        headers: { 'Content-Type': 'application/json' }
      });
      res.setHeader('Content-Type', 'application/x-ndjson');
      response.data.on('data', chunk => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const json = line.replace('data: ', '').trim();
            if (json && json !== '[DONE]') {
              try {
                const parsed = JSON.parse(json);
                const content = parsed.choices?.[0]?.delta?.content || '';
                const done = !!parsed.choices?.[0]?.finish_reason;
                res.write(JSON.stringify({
                  model: parsed.model,
                  created_at: new Date().toISOString(),
                  message: { role: 'assistant', content },
                  done
                }) + '\n');
              } catch {}
            }
          }
        }
      });
      response.data.on('end', () => res.end());
      response.data.on('error', err => res.end());
    } else {
      const response = await axiosPost(openaiUrl, openaiReq, {
        headers: { 'Content-Type': 'application/json' }
      });
      const parsed = response.data;
      const content = parsed.choices?.[0]?.message?.content || '';
      res.json({
        model: parsed.model,
        created_at: new Date().toISOString(),
        message: { role: 'assistant', content },
        done: true
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { model, prompt, stream, ...rest } = req.body;
    const openaiReq = {
      model: model || 'vscode-lm-proxy',
      messages: [{ role: 'user', content: prompt || '' }],
      stream: !!stream,
      ...rest
    };
    const openaiUrl = `${OPENAI_BASE}/chat/completions`;
    if (stream) {
      const response = await axiosPost(openaiUrl, openaiReq, {
        responseType: 'stream',
        headers: { 'Content-Type': 'application/json' }
      });
      res.setHeader('Content-Type', 'application/x-ndjson');
      response.data.on('data', chunk => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const json = line.replace('data: ', '').trim();
            if (json && json !== '[DONE]') {
              try {
                const parsed = JSON.parse(json);
                const content = parsed.choices?.[0]?.delta?.content || '';
                const done = !!parsed.choices?.[0]?.finish_reason;
                res.write(JSON.stringify({
                  model: parsed.model,
                  created_at: new Date().toISOString(),
                  response: content,
                  done
                }) + '\n');
              } catch {}
            }
          }
        }
      });
      response.data.on('end', () => res.end());
      response.data.on('error', err => res.end());
    } else {
      const response = await axiosPost(openaiUrl, openaiReq, {
        headers: { 'Content-Type': 'application/json' }
      });
      const parsed = response.data;
      const content = parsed.choices?.[0]?.message?.content || '';
      res.json({
        model: parsed.model,
        created_at: new Date().toISOString(),
        response: content,
        done: true
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const response = await axiosGet(`${OPENAI_BASE}/models`);
    const models = (response.data.data || []).map(m => ({
      name: m.id,
      model: m.id,
      modified_at: new Date().toISOString(),
      size: 0,
      digest: '',
      details: {
        parent_model: '',
        format: '',
        family: '',
        families: [],
        parameter_size: '',
        quantization_level: ''
      }
    }));
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/show', async (req, res) => {
  try {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: 'model is required' });
    const response = await axiosGet(`${OPENAI_BASE}/models/${encodeURIComponent(model)}`);
    const m = response.data;
    res.json({
      modelfile: '',
      parameters: '',
      template: '',
      details: {
        parent_model: '',
        format: '',
        family: '',
        families: [],
        parameter_size: '',
        quantization_level: ''
      },
      model_info: m,
      capabilities: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const openaiUrl = `${OPENAI_BASE}/chat/completions`;
    const response = await axiosPost(openaiUrl, req.body, {
      headers: req.headers
    });
    res.status(response.status).set(response.headers).send(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.listen(11434, () => {
  console.log('Ollama proxy listening on port 11434');
});
