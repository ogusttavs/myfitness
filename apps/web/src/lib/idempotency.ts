import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um UUID v4 para idempotência de mutations offline.
 * Cliente envia como `client_id`; backend faz UPSERT ON CONFLICT DO NOTHING.
 *
 * Refs: research.json R-03, complexity.json CDD-03.
 */
export function newClientId(): string {
  return uuidv4();
}
