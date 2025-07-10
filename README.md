
# LM-Proxy-Ollama


This project is a Node.js proxy server designed to work with the VSCode LM Proxy extension. It allows you to use models that are not normally available in Copilot Chat—such as GPT-4, GPT-4o Mini, and GPT-3.5 Turbo—in chat mode by exposing API endpoints that mimic Ollama's, enabling Copilot Chat to use these models seamlessly.

**How the flow works:**

```
Ollama Copilot LM Proxy (this project)
    ↓
LM Proxy Extension (VSCode)
    ↓
Picked Model (e.g., GPT-3.5 Turbo, GPT-4o Mini, etc.)
    ↓
Copilot LM API (via our proxy's endpoints)
    ↓
Response in Copilot Chat (using the model you selected)
```

You do NOT need to (and cannot) have the actual Ollama server running. This proxy exposes the same API endpoints as Ollama, but routes requests to the Copilot LM API for the model you select in the LM Proxy extension, allowing you to use those models in GitHub Copilot Chat. if you have Ollama itself running you Won't be able to start the proxy


## Features

- **LM Proxy integration:** Works directly with the VSCode LM Proxy extension.
- **Unlocks advanced models:** Use GPT-4, GPT-4o Mini, GPT-3.5 Turbo, and other models in Copilot Chat's chat mode.
- **OpenAI API compatibility:** Exposes endpoints compatible with Ollama APIs.
- **Model listing and info endpoints** for dynamic model selection.



## How It Works

The proxy listens on port `11434` and exposes endpoints that mimic the Ollama API, specifically for the Copilot Chat LM Proxy extension. When you configure the extension to use this proxy, it forwards chat and completion requests to the Copilot LM API for the model you select (such as GPT-4, GPT-4o Mini, GPT-3.5 Turbo, etc.). This enables Copilot Chat to use models and chat capabilities that are not natively supported, without needing Ollama running.

## "Free/No Premium Request" Models
- **gpt-3.5-turbo**
- **gpt-4**
- **gpt-4-0125-preview**
- **gpt-4o-mini**

These models do **not** appear to use premium requests. However, I am unsure if they are available on the free plan for GitHub Copilot, as I am using the paid version. If you are on the free plan, it's worth testing to see if these models work for you!

## Requirements

- [Node.js](https://nodejs.org/) (v16+ recommended - I have v22.15.0 of NodeJS and 10.9.2 of NPM) 
- [VSCode Copilot Chat LM Proxy extension](https://marketplace.visualstudio.com/items?itemName=ryonakae.vscode-lm-proxy)


## Installation & Setup

1. **Install the "LM Proxy" Extension in VSCode:**
     - Go to the Extensions view (`Ctrl+Shift+X`), search for "LM Proxy", and install it.

2. **Start the Proxy Server from the Extension:**
     - Open the LM Proxy Menu (Bottom right on windows literally says LM Proxy) and click "Start Server"

3. Clone this repository or copy the files to your project directory.

4. Install dependencies:
     ```sh
     npm install
     ```

5. Start the proxy:
     ```sh
     node ollama-proxy.js
     ```
     The proxy will listen on `http://localhost:11434`.

6. In VSCode, configure the Copilot Chat LM Proxy extension to use `http://localhost:11434` as the API endpoint.



## How to Use with GitHub Copilot Chat

1. **Start the Proxy:**
    - Start the proxy as described above. (You do NOT need to have Ollama running.)
2. **Open GitHub Copilot Chat in VSCode.**
3. **Go to the model selector** (at the bottom as of writing this).
4. **Click "Manage Models".**
5. **Select "Ollama"** from the list of available providers (this will use the proxy's endpoints).
6. **Choose your desired model(s)** (e.g., GPT-4, GPT-4o Mini, GPT-3.5 Turbo, or any other model exposed by the LM Proxy extension).
7. **Return to the chat and select the model**
7. **Start coding/chatting!**

## Usage

Configure your VSCode Copilot Chat LM Proxy extension (or any compatible client) to use `http://localhost:11434/v1` as the API base URL.

This enables chat mode with models like GPT-4, GPT-4o Mini, GPT-3.5 Turbo, and any other models exposed by the LM Proxy extension, all routed through this proxy.

## Endpoints

- `POST /v1/chat/completions` — OpenAI-compatible chat completions (used by Copilot Chat LM Proxy)
- `GET /api/tags` — List available models
- `POST /api/show` — Show model details
- `POST /api/chat` — Proxy chat endpoint
- `POST /api/generate` — Proxy generate endpoint


## Notes

- The proxy logs all requests for debugging.
- For more on the Copilot Chat LM Proxy extension, see its documentation.

## License

MIT

## Disclaimer

I do not believe that using this project is against the GitHub Copilot Terms of Service or any related policies. However, please exercise caution and review the relevant terms and documentation yourself to ensure compliance.
