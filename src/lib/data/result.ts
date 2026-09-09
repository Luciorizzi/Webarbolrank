export type LoadResult<T> = { data: T; error: undefined } | { data: undefined; error: string };

export async function loadData<T>(promise: Promise<T>): Promise<LoadResult<T>> {
  try { return { data: await promise, error: undefined }; }
  catch (error) { return { data: undefined, error: error instanceof Error ? error.message : "Error desconocido al cargar Supabase." }; }
}
