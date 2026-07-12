import { db } from '../config/database.js';

/**
 * Settings Model
 * Data access layer for system settings.
 */
const SettingsModel = {
  /**
   * Get all settings, optionally filtered by category
   */
  getAll: async (category = null) => {
    let query = db('settings').where({ is_active: true });
    if (category) {
      query = query.where({ category });
    }
    return query.select('*').orderBy('category', 'key');
  },

  /**
   * Get a setting by key
   */
  getByKey: (key) => {
    return db('settings').where({ key, is_active: true }).first();
  },

  /**
   * Get multiple settings by keys
   */
  getByKeys: (keys) => {
    return db('settings').whereIn('key', keys).where({ is_active: true });
  },

  /**
   * Update a setting
   */
  update: async (key, values) => {
    const [setting] = await db('settings')
      .where({ key })
      .update({ ...values, updated_at: db.fn.now() })
      .returning('*');
    return setting;
  },

  /**
   * Update multiple settings
   */
  updateMultiple: async (settingsUpdates) => {
    for (const { key, ...values } of settingsUpdates) {
      await db('settings')
        .where({ key })
        .update({ ...values, updated_at: db.fn.now() });
    }
    return SettingsModel.getAll();
  }
};

export default SettingsModel;