export async function getCachedData(key: string, fetchFn: () => Promise<any>, ttl = 60): Promise<any> {
  return await fetchFn();
}
