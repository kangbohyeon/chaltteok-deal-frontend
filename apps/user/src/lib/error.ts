type ApiError = { response?: { data?: { errorMessage?: string } } };

export function getApiErrorMessage(err: unknown): string | undefined {
  return (err as ApiError)?.response?.data?.errorMessage;
}
