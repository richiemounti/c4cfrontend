// lib/api/debug-survey-creation.ts
import { getSurvey } from './survey';

export const debugSurveyCreation = async (surveyId: string, maxRetries: number = 3) => {
  console.log(`🔍 Debugging survey creation for ID: ${surveyId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}: Checking if survey exists...`);
      const surveyResponse = await getSurvey(surveyId);
      
      if (surveyResponse.success && surveyResponse.data) {
        console.log(`✅ Survey found on attempt ${attempt}:`, {
          id: surveyResponse.data._id,
          title: surveyResponse.data.title,
          status: surveyResponse.data.status,
          creator: surveyResponse.data.creator
        });
        return { exists: true, survey: surveyResponse.data };
      }
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log(`🚫 Survey not found after ${maxRetries} attempts`);
  return { exists: false, survey: null };
};

export const validateSurveyId = (surveyId: string): boolean => {
  // MongoDB ObjectId validation
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const isValid = objectIdRegex.test(surveyId);
  console.log(`🔍 Survey ID validation for "${surveyId}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  return isValid;
};