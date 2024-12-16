// Manages user chat interactions.
// Purpose: Processes user questions, determines which core query functions or LLM logic to invoke, and returns a response.
// Workflow:
//     Receives user input.
//     Decides which core query functions or LLM logic to call.
//     Returns a user-friendly response.

// routes/api/llm/+server.ts:

import { kv } from '$lib/kv';
import { nanoid } from '$lib/utils';
import type { Config } from '@sveltejs/adapter-vercel';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { queryNeo4j } from '$lib/neo4j';
import 'dotenv/config';

import { env } from '$env/dynamic/private';

import type { RequestHandler } from './$types';

export const config: Config = {
	runtime: 'edge'
};

export const POST = (async ({ request, locals: { getSession } }) => {
	const json = await request.json();
	const { messages, previewToken } = json;
	const session = await getSession();

	// Extract the user's question from the latest message
	const userQuestion =
		messages?.find((msg) => msg.role === 'user')?.content || 'No question provided';

	// Define the schema for the Neo4j database
	const schemaDescription = `
You are an expert in Cypher query generation for Neo4j databases. The graph represents corporate ownership structures in the banking industry with the following schema:

Node Labels:
- Closed, NIC, Entity, LEI, Branch, Regulator, Active, ABC, AbstractEntity, Company, OC, Resolved.

Relationship Types:
- RESOLVED_FROM, ABSTRACTED_FROM, ABSTRACT_RELATIONSHIP, HEAD_OFFICE, IS_FUND_MANAGED_BY, IS_SUBFUND_OF, IS_DIRECTLY_CONSOLIDATED_BY, IS_ULTIMATELY_CONSOLIDATED_BY, IS_INTERNATIONAL_BRANCH_OF, IS_FEEDER_TO, TRANSFORMATION, REGULATED_BY, RELATIONSHIP.

Node Properties:
- ID_RSSD (unique identifier), D_DT_START/D_DT_END (start and end dates), NM_LGL/NM_SHORT (legal/short names), CITY, STATE_CD, CNTRY_NM (location), ID_LEI (Legal Entity Identifier), ENTITY_TYPE, URL.

Relationship Properties:
- RELN_LVL (relationship level), PCT_EQUITY (ownership percentage), D_DT_RELN_EST (relationship establishment date), TRANSFORMATION, REG_IND (regulatory indicator).

### Syntax Rules for Cypher Queries
1. Use the latest Neo4j syntax:
   - Replace \`size((n)--())\` with \`COUNT { (n)--() }\`.
   - Use \`IS NOT NULL\` to filter for property existence.
   - Always validate property existence to avoid runtime errors.
2. Avoid using deprecated syntax or constructs.
3. Optimize queries using \`LIMIT\` for broad queries.
4. Ensure queries are valid for Neo4j version 5.0 and above.

Return only the Cypher query in plain text. Do not include any explanations or annotations.
`;

	// Add the schema description as the system message
	const systemMessage = {
		role: 'system',
		content: schemaDescription
	};

	// Append the schema description to the conversation
	const updatedMessages = [systemMessage, ...messages];

	// Create an OpenAI API client
	const config = new Configuration({
		apiKey: previewToken || env.OPENAI_API_KEY
	});
	const openai = new OpenAIApi(config);

	// Ask OpenAI for a Cypher query
	const response = await openai.createChatCompletion({
		model: 'gpt-4o', // Use 'gpt-4' if needed
		messages: updatedMessages,
		temperature: 0.7
	});

	// Extract the Cypher query from the response
	const completion = await response.json();
	let cypherQuery = completion.choices[0]?.message?.content;

	if (!cypherQuery) {
		return new Response(JSON.stringify({ error: 'No valid Cypher query generated' }), {
			status: 400
		});
	}

	// Sanitize the query to remove Markdown formatting
	function sanitizeQuery(query) {
		return query.replace(/```.*?\n|```/g, '').trim();
	}

	cypherQuery = sanitizeQuery(cypherQuery);

	// Query the Neo4j database
	let queryResult;
	try {
		queryResult = await queryNeo4j(cypherQuery);
	} catch (error) {
		console.error('Neo4j Query Error:', error);
		return new Response(JSON.stringify({ error: 'Failed to execute the Cypher query' }), {
			status: 500
		});
	}

	// Generate a human-readable response using GPT
	const resultMessages = [
		{
			role: 'system',
			content: `You are a helpful assistant that summarizes database results into a clear, user-friendly format. 
			- Consider the user's original question: "${userQuestion}" when summarizing the data.
			- Structure the output into numbered sections for each relevant result.
			- Use bullet points to organize details clearly.
			- Avoid including raw codes or technical terms unless they are explained in plain language.
			- If certain data fields are missing or unavailable, indicate this explicitly.
			- Ensure consistency in formatting across all responses.`
		},
		{
			role: 'user',
			content: `Here is the data: ${JSON.stringify(
				queryResult
			)}. Based on the user's question: "${userQuestion}", please provide a detailed and relevant summary.`
		}
	];

	const resultResponse = await openai.createChatCompletion({
		model: 'gpt-4o',
		messages: resultMessages,
		temperature: 0.7
	});

	const readableResult = await resultResponse.json();
	const humanReadableText = readableResult.choices[0]?.message?.content;

	// Respond with the human-readable result
	return new Response(JSON.stringify({ summary: humanReadableText }), {
		headers: { 'Content-Type': 'application/json' }
	});
}) satisfies RequestHandler;
