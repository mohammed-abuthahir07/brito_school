/**
 * Maps HTTP/network failures to short messages safe to show in the UI.
 * Internal details (SQL, stacks, errno) are never forwarded.
 */
export function isAbortError(error) {
  return Boolean(error?.aborted) || error?.name === 'AbortError';
}

export function toUserFacingMessage(status, serverMessage) {
  const raw = typeof serverMessage === 'string' ? serverMessage.replace(/\s+/g, ' ').trim() : '';
  const looksInternal =
    /stack|sql|errno|exception|econnrefused|etimedout|er_[a-z0-9_]+|unknown column|at \w+\(/i.test(
      raw,
    );
  const brief = !looksInternal && raw.length > 0 && raw.length <= 180 ? raw : '';

  switch (status) {
    case 0:
      return 'Unable to reach the school server. Check your connection and try again.';
    case 400:
      return brief || 'Some details could not be accepted. Please review the form and try again.';
    case 401:
      return brief || 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to complete this action.';
    case 404:
      return 'The requested information could not be found.';
    case 408:
      return 'The request took too long. Please try again.';
    case 409:
      return brief || 'This action conflicts with existing records.';
    case 413:
      return 'The file is too large to upload.';
    case 415:
      return 'That file type is not supported.';
    case 422:
      return brief || 'Please correct the highlighted fields and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      if (status >= 500) {
        return 'The school server is temporarily unavailable. Please try again shortly.';
      }
      return brief || 'Something went wrong. Please try again.';
  }
}
