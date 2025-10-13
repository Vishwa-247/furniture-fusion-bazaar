import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { UserProfile, ProfileFormData } from "@/types/profile";
import { profileService } from "@/api/services/profileService";
import { useToast } from "@/hooks/use-toast";

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize empty profile
  const initializeProfile = (): UserProfile => ({
    userId: user?.id || "",
    personalInfo: {
      fullName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profileData = await profileService.getProfile(user.id);
      
      // Get resume data if available
      const resumeData = await profileService.getUserResume(user.id);
      if (resumeData) {
        profileData.resumeData = {
          filename: resumeData.filename,
          uploadDate: resumeData.upload_date,
          parsedData: resumeData.parsed_data,
          extractedText: resumeData.extracted_text,
          aiAnalysis: resumeData.ai_analysis,
          skillGaps: resumeData.skill_gaps,
          recommendations: resumeData.recommendations,
        };
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile");
      // Initialize fallback profile
      setProfile(initializeProfile());
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileFormData>) => {
    console.log('🔄 updateProfile called:', { 
      userId: user?.id, 
      hasProfile: !!profile,
      updateKeys: Object.keys(updates)
    });
    
    if (!user?.id) {
      const error = new Error('Authentication required - please sign in again');
      console.error('❌ updateProfile failed: no authenticated user');
      throw error;
    }

    setIsLoading(true);
    
    try {
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      
      console.log('✅ Profile updated successfully');
      
    } catch (error) {
      console.error('❌ updateProfile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadResume = async (file: File, jobRole?: string) => {
    if (!profile || !user) return;

    setIsLoading(true);
    try {
      const result = await profileService.uploadResume(file, user.id);
      
      if (result.success) {
        // Reload profile to show updated resume data
        await loadProfile();
        return result;
      } else {
        throw new Error(result?.message || 'Failed to extract profile data');
      }

    } catch (error) {
      console.error("Failed to upload resume:", error);
      toast({
        title: "Error",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const applyExtractedData = async (extractedData: any) => {
    if (!user || !extractedData) return;
    
    setIsLoading(true);
    try {
      const success = await profileService.applyExtractedData(user.id, extractedData);
      
      if (success) {
        // Reload profile to get updated data
        await loadProfile();
        
        toast({
          title: "Success! 🎉",
          description: "Your profile has been automatically filled with extracted data from your resume.",
        });
        
        return true;
      } else {
        throw new Error('Failed to apply extracted data');
      }
    } catch (error) {
      console.error("Failed to apply extracted data:", error);
      toast({
        title: "Error", 
        description: "Failed to apply extracted data. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResume = async () => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const success = await profileService.deleteResume(user.id);
      
      if (success) {
        // Reload profile to remove resume data
        await loadProfile();
        
        toast({
          title: "Resume Deleted",
          description: "Your resume has been successfully deleted.",
        });
        
        return true;
      } else {
        throw new Error('Failed to delete resume');
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadResume,
    applyExtractedData,
    deleteResume,
    loadProfile,
  };
};