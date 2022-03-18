export default async (seconds: number): Promise<void> => {
	await new Promise<void>((resolve) => {
		setTimeout(resolve, seconds * 1000);
	});
};
