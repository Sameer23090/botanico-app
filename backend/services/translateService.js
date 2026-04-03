const { Translate } = require('@google-cloud/translate').v2;

// Initialize Google Translate API with project ID and Key
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

/**
 * Translates text into English
 * @param {string} text - The input text to translate
 * @param {string} sourceLanguage - Language code ('ta', 'ml', 'te', etc.)
 * @returns {Promise<string>} - The translated English string
 */
const translateToEnglish = async (text, sourceLanguage) => {
  if (!text || sourceLanguage === 'en' || !sourceLanguage) {
    return text;
  }

  try {
    const [translation] = await translate.translate(text, {
      from: sourceLanguage,
      to: 'en'
    });
    return translation;
  } catch (error) {
    console.error('Error in translateToEnglish:', error);
    // If translation fails, return original text to avoid data loss
    return text;
  }
};

/**
 * Utility to translate multiple fields of an object
 * @param {Object} data - Input data object
 * @param {Array<string>} fields - Field names to translate
 * @param {string} sourceLanguage - The user's language
 * @returns {Promise<Object>} - The updated data object with translated fields
 */
const translateFields = async (data, fields, sourceLanguage) => {
  if (!sourceLanguage || sourceLanguage === 'en') {
    return data;
  }

  const translatedData = { ...data };
  
  for (const field of fields) {
    if (translatedData[field] && typeof translatedData[field] === 'string') {
      translatedData[field] = await translateToEnglish(translatedData[field], sourceLanguage);
    }
  }

  return translatedData;
};

module.exports = {
  translateToEnglish,
  translateFields
};
