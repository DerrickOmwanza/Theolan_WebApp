import { db } from '../config/database.js';

/**
 * Settings Model
 * Simple key-value store for system settings.
 * 
 * Production schema (3 columns only):
 * - key: string, NOT NULL, PRIMARY KEY
 * - value: text, nullable
 * - updated_at: timestamptz, nullable, default now()
 */
const SettingsModel = {
  /**
   * Get a setting value by key
   * @param {string} key - The setting key
   * @returns {Promise<string|null>} - The value or null if not found
   */
  get: (key) => {
    return db('settings')
      .where({ key })
      .first()
      .then(row => row ? row.value : null);
  },

  /**
   * Set a key-value pair (insert or update)
   * Uses atomic upsert via onConflict().merge() to prevent race conditions
   * @param {string} key - The setting key
   * @param {string} value - The setting value (can be null)
   * @returns {Promise<void>}
   */
  set: (key, value) => {
    return db('settings')
      .insert({ key, value, updated_at: db.fn.now() })
      .onConflict('key')
      .merge({ value, updated_at: db.fn.now() });
  },

  /**
   * Get all settings as key-value pairs
   * @returns {Promise<Array<{key: string, value: string|null}>>}
   */
  getAll: () => {
    return db('settings')
      .select('key', 'value')
      .orderBy('key');
  },

  /**
   * Delete a setting by key
   * @param {string} key - The setting key to delete
   * @returns {Promise<void>}
   */
  delete: (key) => {
    return db('settings').where({ key }).del();
  }
};

export default SettingsModel;