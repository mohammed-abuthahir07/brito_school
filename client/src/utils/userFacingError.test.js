import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isAbortError, toUserFacingMessage } from './userFacingError.js';

describe('userFacingError', () => {
  it('maps network failure without exposing internals', () => {
    assert.equal(
      toUserFacingMessage(0, 'ECONNREFUSED 127.0.0.1:5000'),
      'Unable to reach the school server. Check your connection and try again.',
    );
  });

  it('strips SQL and stack traces from 400 bodies', () => {
    const message = toUserFacingMessage(400, 'ER_BAD_FIELD_ERROR: Unknown column at Query.run');
    assert.equal(
      message,
      'Some details could not be accepted. Please review the form and try again.',
    );
  });

  it('forwards short safe 409 messages', () => {
    assert.equal(
      toUserFacingMessage(409, 'Gallery can hold a maximum of 30 photographs.'),
      'Gallery can hold a maximum of 30 photographs.',
    );
  });

  it('never forwards 500 internals', () => {
    assert.equal(
      toUserFacingMessage(500, 'Error: connect ETIMEDOUT\n    at TCPConnectWrap'),
      'The school server is temporarily unavailable. Please try again shortly.',
    );
  });

  it('detects abort errors', () => {
    assert.equal(isAbortError({ aborted: true }), true);
    assert.equal(isAbortError({ name: 'AbortError' }), true);
    assert.equal(isAbortError({ message: 'fail' }), false);
  });
});
