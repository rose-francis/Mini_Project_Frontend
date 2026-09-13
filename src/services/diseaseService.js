/**
 * Disease Prediction Service
 * Handles communication with FastAPI backend for disease prediction
 */

import { BACKEND_URL } from '../config/api';

/**
 * Fetch available symptoms from backend
 */
export const fetchAvailableSymptoms = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/symptoms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.symptoms || [];
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    throw error;
  }
};

/**
 * Predict disease based on selected symptoms
 * @param {Array<string>} symptoms - List of selected symptom names
 * @returns {Promise<Object>} - Predictions with confidence scores
 */
export const predictDisease = async (symptoms) => {
  try {
    if (!symptoms || symptoms.length === 0) {
      throw new Error('At least one symptom must be selected');
    }

    const response = await fetch(`${BACKEND_URL}/predict-disease`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symptoms: symptoms,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error predicting disease:', error);
    throw error;
  }
};

/**
 * Gets the current backend URL being used
 */
export const getBackendUrl = () => BACKEND_URL;

export default {
  fetchAvailableSymptoms,
  predictDisease,
  getBackendUrl,
};
