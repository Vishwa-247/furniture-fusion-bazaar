import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Container from "@/components/ui/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings as SettingsIcon, 
  Key, 
  User, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSettings {
  id?: string;
  user_id: string;
  gemini_api_key?: string;
  preferred_difficulty: string;
  preferred_language: string;
  theme_preference: string;
  created_at?: string;
  updated_at?: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setTempApiKey(data.gemini_api_key || "");
      } else {
        // Create default settings
        const defaultSettings: UserSettings = {
          user_id: user.id,
          preferred_difficulty: 'intermediate',
          preferred_language: 'en',
          theme_preference: 'system'
        };
        
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid Gemini API key.",
        variant: "destructive",
      });
      return;
    }

    await updateSettings({ gemini_api_key: tempApiKey.trim() });
  };

  const handleRemoveApiKey = async () => {
    if (!confirm("Are you sure you want to remove your Gemini API key? This will disable AI-powered course generation.")) {
      return;
    }

    setTempApiKey("");
    await updateSettings({ gemini_api_key: null });
  };

  if (!user) {
    return (
      <Container className="py-12">
        <Alert>
          <AlertDescription>
            Please sign in to access your settings.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-10 bg-muted animate-pulse rounded" />
                    <div className="h-10 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <SettingsIcon className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and API configurations
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user.email || ""} 
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  value={user.user_metadata?.full_name || ""} 
                  disabled
                  className="bg-muted"
                  placeholder="Not provided"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Profile information is managed through your authentication provider.
            </p>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              AI API Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI API keys for enhanced course generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gemini API Key */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="gemini-api-key" className="text-base font-medium">
                    Gemini API Key
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Required for AI-powered course content generation
                  </p>
                </div>
                {settings?.gemini_api_key && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="gemini-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button 
                  onClick={handleSaveApiKey}
                  disabled={isSaving || !tempApiKey.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>

              {settings?.gemini_api_key && (
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    API key is configured and ready to use
                  </span>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleRemoveApiKey}
                  >
                    Remove Key
                  </Button>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored securely and encrypted. Get your Gemini API key from{" "}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google AI Studio
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Learning Preferences
            </CardTitle>
            <CardDescription>
              Customize your default learning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Preferred Difficulty</Label>
                <Select
                  value={settings?.preferred_difficulty || 'intermediate'}
                  onValueChange={(value) => updateSettings({ preferred_difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={settings?.preferred_language || 'en'}
                  onValueChange={(value) => updateSettings({ preferred_language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme Preference</Label>
              <Select
                value={settings?.theme_preference || 'system'}
                onValueChange={(value) => updateSettings({ theme_preference: value })}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security and data privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
            
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-medium">Last Sign In</p>
                <p className="text-sm text-muted-foreground">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your data is encrypted and stored securely. We never share your personal information with third parties.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default Settings;