'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, type ProfileUpdateData } from '@/actions/update-profile'
import { resizeImage } from '@/lib/image-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Edit3Icon, Loader2, CameraIcon, UploadCloudIcon, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'

type Profile = {
    id: string
    username: string
    full_name: string | null
    bio: string | null
    website: string | null
    location: string | null
    profession: string | null
    avatar_url: string | null
    banner_url: string | null
}

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [formData, setFormData] = useState<ProfileUpdateData>({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        profession: profile.profession || '',
        website: profile.website || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || ''
    })

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, bucket: 'avatars' | 'banners', field: 'avatar_url' | 'banner_url') => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const isAvatar = field === 'avatar_url'
            const optimizedBlob = await resizeImage(file, {
                maxWidth: isAvatar ? 400 : 1200,
                maxHeight: isAvatar ? 400 : 600,
                quality: 0.8
            })

            const fileName = `${profile.id}/${crypto.randomUUID()}.jpg`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, optimizedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, [field]: publicUrl }))
            toast.success(`${isAvatar ? 'Avatar' : 'Banner'} optimized and ready!`)
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Error processing or uploading image')
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateProfile(profile.id, formData)
            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Profile updated successfully')

            if (formData.username && formData.username !== profile.username) {
                router.push(`/p/${formData.username}`)
            } else {
                router.refresh()
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-none bg-transparent py-0">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-3xl font-bold tracking-tight">Public Profile</CardTitle>
                    <CardDescription className="text-lg">
                        This is how others will see you on ImagineOS.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-8">
                    {/* Images Section */}
                    <div className="space-y-4">
                        <Label>Profile Branding</Label>
                        <div className="grid gap-6">
                            {/* Banner Upload */}
                            <button
                                type="button"
                                className="relative h-48 w-full rounded-2xl bg-muted overflow-hidden group border border-border/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all hover:border-primary/50"
                                onClick={() => bannerInputRef.current?.click()}
                                aria-label="Upload new banner"
                            >
                                {formData.banner_url ? (
                                    <img src={formData.banner_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101" alt="Current banner profile" width={1200} height={400} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                        <UploadCloudIcon className="w-8 h-8 opacity-20" aria-hidden="true" />
                                        <span className="text-sm font-medium opacity-60">Upload Banner</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-md shadow-xl border border-white/20">
                                        <CameraIcon className="w-6 h-6 text-white" aria-hidden="true" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'banners', 'banner_url')}
                                />
                            </button>

                            {/* Avatar Upload */}
                            <div className="flex items-end gap-6 -mt-16 px-6 relative z-10">
                                <button
                                    type="button"
                                    className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden relative group cursor-pointer shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 transition-transform hover:scale-105"
                                    onClick={() => avatarInputRef.current?.click()}
                                    aria-label="Upload new avatar"
                                >
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Current avatar profile" width={400} height={400} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-secondary">
                                            <Edit3Icon className="w-10 h-10 opacity-20" aria-hidden="true" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/10">
                                            <CameraIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                        </div>
                                    </div>
                                </button>
                                <div className="pb-4 space-y-1">
                                    <h3 className="font-bold text-xl">{formData.full_name || formData.username}</h3>
                                    <p className="text-sm text-muted-foreground">Recommended: 400x400px</p>
                                </div>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'avatars', 'avatar_url')}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold uppercase tracking-wider opacity-60">Display Name</Label>
                            <Input
                                id="name"
                                value={formData.full_name || ''}
                                autoComplete="name"
                                className="h-12 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-semibold uppercase tracking-wider opacity-60">Username</Label>
                            <Input
                                id="username"
                                value={formData.username || ''}
                                autoComplete="username"
                                spellCheck={false}
                                className="h-12 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profession" className="text-sm font-semibold uppercase tracking-wider opacity-60">Profession</Label>
                            <Input
                                id="profession"
                                placeholder="e.g. AI Artist"
                                value={formData.profession || ''}
                                className="h-12 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm font-semibold uppercase tracking-wider opacity-60">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Tokyo, Japan"
                                value={formData.location || ''}
                                className="h-12 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="website" className="text-sm font-semibold uppercase tracking-wider opacity-60">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                inputMode="url"
                                placeholder="https://..."
                                value={formData.website || ''}
                                className="h-12 bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio" className="text-sm font-semibold uppercase tracking-wider opacity-60">Bio</Label>
                            <Textarea
                                id="bio"
                                rows={4}
                                placeholder="Tell us about yourself…"
                                value={formData.bio || ''}
                                className="bg-muted/30 border-none shadow-none focus-visible:ring-2 focus-visible:ring-primary transition-all py-3 resize-none"
                                aria-describedby="bio-description"
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            />
                            <p id="bio-description" className="text-[10px] text-muted-foreground px-1">
                                Max 500 characters. Your bio will be displayed on your public profile.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-0 pt-8 flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading || isUploading}
                        className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-102 hover:shadow-xl active:scale-98"
                    >
                        {isLoading || isUploading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <SaveIcon className="mr-2 h-5 w-5" />
                        )}
                        Update Profile
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
