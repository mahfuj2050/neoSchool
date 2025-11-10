import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';

type SettingsData = {
  appName: string;
  theme: 'light' | 'dark' | 'system';
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordRequiresSpecialChar: boolean;
  passwordRequiresNumber: boolean;
};

export const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    appName: 'My App',
    theme: 'system',
    enableRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    passwordRequiresSpecialChar: true,
    passwordRequiresNumber: true,
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch these from your API
        // const response = await api.get('/api/settings');
        // setSettings(response.data);
        
        // Simulate API call
        setTimeout(() => {
          setSettings({
            appName: 'My App',
            theme: 'system',
            enableRegistration: true,
            requireEmailVerification: true,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            passwordRequiresSpecialChar: true,
            passwordRequiresNumber: true,
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings. Please try again later.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (name: keyof SettingsData, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // In a real app, you would send these to your API
      // await api.put('/api/settings', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage application settings and configurations
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input
                    id="appName"
                    name="appName"
                    value={settings.appName}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1">
                    <Label htmlFor="enableRegistration">Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to create accounts
                    </p>
                  </div>
                  <Switch
                    id="enableRegistration"
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => handleSwitchChange('enableRegistration', checked)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    name="sessionTimeout"
                    type="number"
                    min={1}
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                  <p className="text-sm text-muted-foreground">
                    Time of inactivity before a user is automatically logged out
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-1">
                    <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email address before accessing the application
                    </p>
                  </div>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => handleSwitchChange('requireEmailVerification', checked)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    name="maxLoginAttempts"
                    type="number"
                    min={1}
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of failed login attempts before account is locked
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-medium">Password Requirements</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Length</Label>
                    <Input
                      id="passwordMinLength"
                      name="passwordMinLength"
                      type="number"
                      min={4}
                      max={128}
                      value={settings.passwordMinLength}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                      <Label htmlFor="passwordRequiresNumber">Require Numbers</Label>
                      <p className="text-sm text-muted-foreground">
                        Password must contain at least one number
                      </p>
                    </div>
                    <Switch
                      id="passwordRequiresNumber"
                      checked={settings.passwordRequiresNumber}
                      onCheckedChange={(checked) => handleSwitchChange('passwordRequiresNumber', checked)}
                      disabled={isSaving}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                      <Label htmlFor="passwordRequiresSpecialChar">Require Special Character</Label>
                      <p className="text-sm text-muted-foreground">
                        Password must contain at least one special character (!@#$%^&*)
                      </p>
                    </div>
                    <Switch
                      id="passwordRequiresSpecialChar"
                      checked={settings.passwordRequiresSpecialChar}
                      onCheckedChange={(checked) => handleSwitchChange('passwordRequiresSpecialChar', checked)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <select
                    id="theme"
                    name="theme"
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      theme: e.target.value as 'light' | 'dark' | 'system'
                    }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Set the default theme for the application
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
