# Muesli

This is a demo application that shows off what you can build with the [Recall.ai Desktop Recording SDK.](https://www.recall.ai/product/desktop-recording-sdk)

This repo is intended to be a mockup of the kind of experience you can build using the Desktop Recording SDK.

Need help? Reach out to our support team [support@recall.ai](mailto:support@recall.ai).

# Setup

- Copy the `env.example` file to a `.env` file:
    - `cp .env.example .env`

- Replace `RECALLAI_API_URL` with the base URL for the [Recall region](https://docs.recall.ai/docs/regions#/) that you're using that matches your API key, example:
    - `RECALLAI_API_URL=https://us-east-1.recall.ai`

- Modify `.env` to include your Recall.ai API key:
    - `RECALLAI_API_KEY=<your key>`

This project uses live transcription through Recall.ai. Set `RECALLAI_TRANSCRIPT_PROVIDER` to the provider you configured in the Recall transcription credential dashboard:

```
RECALLAI_TRANSCRIPT_PROVIDER=deepgram_streaming
```

For AssemblyAI, use `assembly_ai_v3_streaming`. For Deepgram, use `deepgram_streaming` and make sure the Deepgram credential is marked as default in the Recall dashboard with a Project ID.

For meetings where people switch languages, configure Deepgram's multilingual code-switching mode:

```
RECALLAI_TRANSCRIPT_PROVIDER=deepgram_streaming
RECALLAI_TRANSCRIPT_PROVIDER_CONFIG={"model":"nova-3","language":"multi","diarize":true}
```

If you want to avoid third-party transcription credential setup, use Recall.ai transcription instead:

```
RECALLAI_TRANSCRIPT_PROVIDER=recallai_streaming
RECALLAI_TRANSCRIPT_PROVIDER_CONFIG={"mode":"prioritize_low_latency"}
```

Deepgram setup requires a Deepgram API key with Member, Admin, or Owner role. The Default role will fail. The credential must be configured in the same Recall region as `RECALLAI_API_URL`, marked as default, and saved with your Deepgram Project ID. Deepgram EU processing is currently listed by Recall as an early-access beta, so contact Recall support if `deepgram_streaming` fails in `eu-central-1` even after those settings are correct.

Recall.ai's own `recallai_streaming` provider only supports multilingual/code-switching in `prioritize_accuracy` mode, which sends transcript events every 3-10 minutes. The `prioritize_low_latency` mode used for second-level live transcripts is English-only.

For ad-hoc or in-person desktop recordings, Recall's normalized transcript labels local audio as `Host` and other desktop audio as `Guest`. Deepgram's `diarize: true` adds anonymous machine speaker IDs in `transcript.provider_data`, which this app displays as `Speaker 0`, `Speaker 1`, etc.

If you want to enable the AI summary after a recording is finished, you can specify an OpenRouter API key.

```
OPENROUTER_KEY=<your key>
OPENROUTER_MODEL=anthropic/claude-3.7-sonnet
```

To launch the Muesli application, start the server first, then the app:

```sh
npm ci
npm start
```

# Screenshots

![Screenshot 2025-06-16 at 10 10 57 PM](https://github.com/user-attachments/assets/9df12246-b5be-466d-958e-e09ff0b4b3cb)
![Screenshot 2025-06-16 at 10 22 44 PM](https://github.com/user-attachments/assets/685f13ab-7c02-4f29-a987-830d331c4d36)
![Screenshot 2025-06-16 at 10 14 38 PM](https://github.com/user-attachments/assets/75817823-084c-46b0-bbe8-e0195a3f9051)
