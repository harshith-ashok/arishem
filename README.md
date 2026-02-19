# Arishem AI — Hackathon Idea Evaluator

![React](https://img.shields.io/badge/React-Frontend-blue?style=flat-square)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

Arishem AI is a lightweight hackathon idea evaluation tool that simulates a **strict first-round judge**.

It analyzes a project idea and returns:
- Judge-style scoring
- Strengths & rejection risks
- Key improvement suggestion
- High-scoring title variations
- Theme-aligned title alternatives

All evaluations run using a **local LLM via Ollama**.

---

## Features

- Fast hackathon-style idea screening
- Structured AI evaluation (JSON output)
- Alternate project title generation
- Theme-aware suggestions
- Minimal single-page interface

---

## Requirements

- Node.js 18+
- Ollama installed

Pull a model:

```bash
ollama pull qwen3:8b
````

---

## Run Project

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Make sure Ollama is running locally:

```
http://localhost:11434
```

---

## How It Works

1. Enter idea title, theme, and description
2. App sends prompt to local LLM
3. Model returns strict JSON evaluation
4. UI displays judge-style feedback instantly

---

## Model Used

Default:

```
qwen3:8b
```

(Any Ollama-compatible model can be swapped.)
