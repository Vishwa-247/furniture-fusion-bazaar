import { apiClient } from '../client';
import { MockInterviewType, InterviewQuestionType, InterviewAnalysisType } from '../../types';

export interface InterviewStartRequest {
  job_role: string;
  tech_stack: string;
  experience: string;
  interview_type?: 'technical' | 'behavioral' | 'mixed';
  question_count?: number;
}

export interface InterviewStartResponse {
  interview_id: string;
  questions: InterviewQuestionType[];
  estimated_duration: number;
}

export const interviewService = {
  async startInterview(request: InterviewStartRequest): Promise<InterviewStartResponse> {
    const response = await apiClient.post('/interviews/start', request);
    return response;
  },

  async getInterviews(): Promise<MockInterviewType[]> {
    const response = await apiClient.get('/interviews');
    return response.data || [];
  },

  async getInterview(interviewId: string): Promise<MockInterviewType & { questions: InterviewQuestionType[] }> {
    const response = await apiClient.get(`/interviews/${interviewId}`);
    return response.data;
  },

  async analyzeInterview(interviewId: string, analysisData: any): Promise<InterviewAnalysisType> {
    const response = await apiClient.post(`/interviews/${interviewId}/analyze`, analysisData);
    return response.data;
  },

  // Legacy methods for compatibility
  async createMockInterview(interviewData: Partial<MockInterviewType>): Promise<MockInterviewType> {
    const request: InterviewStartRequest = {
      job_role: interviewData.job_role || 'Software Developer',
      tech_stack: interviewData.tech_stack || 'JavaScript',
      experience: interviewData.experience || 'intermediate',
      interview_type: 'mixed',
      question_count: 5
    };
    
    const response = await this.startInterview(request);
    
    // Return mock interview object for compatibility
    return {
      id: response.interview_id,
      user_id: 'current_user',
      job_role: request.job_role,
      tech_stack: request.tech_stack,
      experience: request.experience,
      created_at: new Date().toISOString(),
      completed: false
    };
  },

  async getInterviewQuestions(interviewId: string): Promise<InterviewQuestionType[]> {
    const interview = await this.getInterview(interviewId);
    return interview.questions || [];
  },

  async submitInterviewResponses(interviewId: string, responses: any[]): Promise<void> {
    // This would update the interview with user responses
    console.log('Submit interview responses:', interviewId, responses);
  }
};