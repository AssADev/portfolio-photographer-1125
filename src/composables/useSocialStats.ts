import { ref } from 'vue';

export function useSocialStats() {
	const loading = ref(false);
	const error = ref<string | null>(null);

	const fetchInstagramFollowers = async (accessToken: string) => {
		try {
			loading.value = true;
			const response = await fetch(
				`https://graph.instagram.com/me?fields=followers_count&access_token=${accessToken}`
			);
			const data = await response.json();
			return data.followers_count;
		} catch (e) {
			error.value = (e as Error).message;
			return null;
		} finally {
			loading.value = false;
		}
	};

	const fetchTikTokFollowers = async (accessToken: string, _username: string) => {
		try {
			loading.value = true;
			const response = await fetch(`https://open.tiktokapis.com/v2/user/info/`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});
			const data = await response.json();
			return data.data.user.follower_count;
		} catch (e) {
			error.value = (e as Error).message;
			return null;
		} finally {
			loading.value = false;
		}
	};

	return {
		loading,
		error,
		fetchInstagramFollowers,
		fetchTikTokFollowers
	};
}
