<script lang="ts">
	import { page } from '$app/stores';
	import ClearHistory from '$lib/components/ClearHistory.svelte';
	import LoginButton from '$lib/components/LoginButton.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import SidebarFooter from '$lib/components/SidebarFooter.svelte';
	import SidebarList from '$lib/components/SidebarList.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import UserMenu from '$lib/components/UserMenu.svelte';
	import { IconSeparator, IconSvelteChat } from '$lib/components/ui/icons';
	import type { Chat } from '$lib/types';

	export let chats: Chat[];
</script>

<header
	class="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl"
>
	<div class="flex items-center">
		{#if $page.data.session}
			<Sidebar>
				<SidebarList {chats} />
				<SidebarFooter>
					<ThemeToggle />
					<ClearHistory />
				</SidebarFooter>
			</Sidebar>
		{:else}
			<a href="/" target="_blank" rel="nofollow">
				<IconSvelteChat class="mr-2 h-6 w-6 dark:hidden" inverted />
				<IconSvelteChat class="mr-2 hidden h-6 w-6 dark:block" />
			</a>
		{/if}
		<div class="flex items-center">
			<IconSeparator class="h-6 w-6 text-muted-foreground/50" />
			{#if $page.data.session}
				<UserMenu />
			
			{/if}
		</div>
	</div>
</header>
