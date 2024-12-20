// Logic for interacting with OpenAI GPT API

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai-edge';
import { env } from '$env/dynamic/private';

export async function useGPT_API(
	clientMessages: ChatCompletionRequestMessage[],
	previewToken: string,
	model = 'gpt-4o',
	temperature = 0.7
) {
	const config = new Configuration({
		apiKey: previewToken || env.OPENAI_API_KEY
	});

	const openai = new OpenAIApi(config);

	const response = await openai.createChatCompletion({
		model: model,
		messages: clientMessages,
		temperature: temperature
	});

	const completion = await response.json();
	if (!completion) {
		return new Response(JSON.stringify({ error: 'OpenAI GPT API failed' }), {
			status: 500
		});
	}

	return completion;
}
