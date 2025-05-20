"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import type { User, ProfileFormValues } from '@/types';
import apiClient from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, User as UserIcon, Mail, Shield, Bell, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  profilePictureFile: z.instanceof(File).optional().nullable(),
  notificationsEnabled: z.boolean().default(true),
});

const API_BASE_URL_FOR_FILES = 'https://warrityweb-api-x1ev.onrender.com';

export function ProfileForm() {
  const { user, token, fetchUserProfile, updateUserInContext } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      profilePictureFile: null,
      notificationsEnabled: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        profilePictureFile: null,
        notificationsEnabled: true, // Default to true, could be fetched from user preferences
      });
      if (user.profilePicture) {
        setProfilePicPreview(`${API_BASE_URL_FOR_FILES}${user.profilePicture}`);
      } else {
        setProfilePicPreview(null);
      }
    }
  }, [user, form]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('profilePictureFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user || !token) return;
    setIsSubmitting(true);

    try {
      // Handle profile picture upload if a new file is selected
      if (values.profilePictureFile) {
        const formData = new FormData();
        formData.append('profilePicture', values.profilePictureFile);
        
        const uploadResponse = await apiClient<User>(`/users/${user._id}/profile-picture`, {
            method: 'POST',
            body: formData,
            token,
        });
        updateUserInContext(uploadResponse);
        toast({ title: "Success", description: "Profile picture updated." });
      }

      let updateMessage = "Profile updated successfully.";
      let updateData: any = {};
      
      if (activeTab === "profile") {
        updateData = { username: values.username, email: values.email };
      } else if (activeTab === "notifications") {
        updateData = { notificationsEnabled: values.notificationsEnabled };
        updateMessage = "Notification preferences updated.";
      }

      // Update user profile
      if (Object.keys(updateData).length > 0) {
        const updateResponse = await apiClient<User>(`/users/${user._id}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData),
          token,
        });
        updateUserInContext(updateResponse);
        toast({ title: "Success", description: updateMessage });
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Calculate account age
  const accountCreated = user.createdAt ? new Date(user.createdAt) : new Date();
  const accountAge = Math.floor((new Date().getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Profile header with avatar and stats */}
      <div className="mb-4 bg-gray-900 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-lime-300 shadow-md">
              <AvatarImage src={profilePicPreview || undefined} alt={user?.username} />
              <AvatarFallback className="text-lg bg-gray-800 text-white">{getInitials(user?.username)}</AvatarFallback>
            </Avatar>
            <label 
              htmlFor="profile-picture" 
              className="absolute -bottom-1 -right-1 bg-lime-300 text-black h-6 w-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-lime-400 transition-colors shadow-sm"
            >
              <UploadCloud className="h-3 w-3" />
            </label>
            <Input 
              id="profile-picture" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user?.username || 'User'}</h2>
            <p className="text-xs text-gray-400">{user?.email || 'email@example.com'}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                {user?.role || 'user'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
              </Badge>
            </div>
          </div>
        </div>
      </div>



      {/* Tabs navigation */}
      <div className="mb-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-800 border border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-lime-300 data-[state=active]:text-black">
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-lime-300 data-[state=active]:text-black">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-lime-300 data-[state=active]:text-black">
              Security
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Profile tab */}
              <TabsContent value="profile" className="mt-4">
                <div className="bg-gray-900 rounded-xl p-4 space-y-4">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-sm">Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="Your username" 
                                className="pl-9 bg-gray-800 border-gray-700 focus:border-lime-300 text-white" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300 text-sm">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                              <Input 
                                placeholder="Your email" 
                                className="pl-9 bg-gray-800 border-gray-700 focus:border-lime-300 text-white" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => form.reset()} 
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !form.formState.isDirty}
                      className="bg-lime-300 text-black hover:bg-lime-400"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Notifications tab */}
              <TabsContent value="notifications" className="mt-4">
                <div className="bg-gray-900 rounded-xl p-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="notificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between py-3 border-b border-gray-800">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white text-sm">Email Notifications</FormLabel>
                          <FormDescription className="text-xs text-gray-400">
                            Receive notifications about warranty expirations
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-lime-300 data-[state=checked]:text-black"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between py-3 border-b border-gray-800">
                    <div className="space-y-0.5">
                      <span className="text-sm text-white">Warranty Expiration Alerts</span>
                      <p className="text-xs text-gray-400">
                        Get notified when warranties are about to expire
                      </p>
                    </div>
                    <Switch checked={true} disabled className="data-[state=checked]:bg-lime-300 data-[state=checked]:text-black" />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <span className="text-sm text-white">Marketing Emails</span>
                      <p className="text-xs text-gray-400">
                        Receive emails about new features and promotions
                      </p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>

                  <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !form.formState.isDirty}
                      className="bg-lime-300 text-black hover:bg-lime-400"
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Security tab */}
              <TabsContent value="security" className="mt-4">
                <div className="bg-gray-900 rounded-xl p-4 space-y-4">
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-white mb-1">Password Management</h3>
                    <p className="text-xs text-gray-400 mb-3">Your password should be at least 8 characters and include a mix of letters, numbers, and symbols.</p>
                    <Button 
                      variant="outline" 
                      disabled 
                      className="text-xs h-8 border-gray-700 text-gray-300"
                    >
                      Change Password
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-white mb-1">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-400 mb-3">Add an extra layer of security to your account by enabling two-factor authentication.</p>
                    <Button 
                      variant="outline" 
                      disabled 
                      className="text-xs h-8 border-gray-700 text-gray-300"
                    >
                      Enable 2FA
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium text-white mb-1">Active Sessions</h3>
                    <p className="text-xs text-gray-400 mb-3">You are currently logged in from this device.</p>
                    <Button 
                      variant="destructive" 
                      disabled 
                      className="text-xs h-8 bg-red-600 hover:bg-red-700"
                    >
                      Sign Out All Devices
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}
