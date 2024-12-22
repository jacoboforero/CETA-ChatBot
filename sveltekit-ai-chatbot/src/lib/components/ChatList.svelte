<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import type { UseChatHelpers } from 'ai/svelte';
	import { marked } from 'marked'; // Markdown renderer

	export let messages: UseChatHelpers['messages'];

	// Function to render markdown
	function renderMarkdown(content: string): string {
		return marked(content);
	}

	// Function to extract and process the `summary` field
	function extractSummary(rawContent: string): string {
		try {
			// Parse the JSON and return the `summary` field
			const parsed = JSON.parse(rawContent);
			return parsed.summary || 'No summary available.';
		} catch (error) {
			// If parsing fails, return the raw content
			return rawContent;
		}
	}
</script>

{#if $messages?.length}
	<div class="relative mx-auto max-w-2xl px-4">
		{#each $messages as message, index}
			<div>
				<ChatMessage {message}>
					<div class="prose">
						<!-- Extract and render the `summary` as Markdown -->
						{@html renderMarkdown(extractSummary(message.content))}
					</div>
				</ChatMessage>
				{#if index < $messages.length - 1}
					<Separator class="my-4 md:my-8" />
				{/if}
			</div>
		{/each}
	</div>
{/if}
