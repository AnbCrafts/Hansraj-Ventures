export const clearCacheData = () => {
	if ("caches" in window) {
		caches.keys().then((names) => {
			if (names.length > 0) {
				names.forEach((name) => {
					caches.delete(name);
				});
				window.location.reload(true);
			}
		});
	}
};
