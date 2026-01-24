'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, type ProfileUpdateData } from '@/actions/update-profile'
import { resizeImage } from '@/lib/image-utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Edit3Icon, Loader2, CameraIcon, UploadCloudIcon } from 'lucide-react'
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

export function EditProfileDialog({ profile, children }: { profile: Profile, children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
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
            // Resize image based on target field
            const isAvatar = field === 'avatar_url'
            const optimizedBlob = await resizeImage(file, {
                maxWidth: isAvatar ? 400 : 1200,
                maxHeight: isAvatar ? 400 : 600,
                quality: 0.8
            })

            const fileName = `${profile.id}/${crypto.randomUUID()}.jpg`
            const filePath = `${fileName}`

            // Direct upload optimized blob to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, optimizedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Get Public URL
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

            setOpen(false)

            // Handle username change redirection
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-background">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">

                    {/* Images Section */}
                    <div className="space-y-4">
                        {/* Banner Upload */}
                        <button type="button" className="relative h-32 w-full rounded-lg bg-muted overflow-hidden group border border-input cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            onClick={() => bannerInputRef.current?.click()}
                            aria-label="Upload new banner">
                            {formData.banner_url ? (
                                <img src={formData.banner_url} className="w-full h-full object-cover" alt="Current banner profile" width={1200} height={400} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <UploadCloudIcon className="w-8 h-8 opacity-50" aria-hidden="true" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-8 h-8 text-white" aria-hidden="true" />
                            </div>
                            <input
                                type="file"
                                ref={bannerInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'avatars', 'banner_url')}
                            />
                        </button>

                        {/* Avatar Upload */}
                        <div className="-mt-12 ml-4 relative inline-block">
                            <button type="button" className="h-24 w-24 rounded-full border-4 border-background bg-muted overflow-hidden relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                onClick={() => avatarInputRef.current?.click()}
                                aria-label="Upload new avatar">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} className="w-full h-full object-cover" alt="Current avatar profile" width={400} height={400} />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-secondary">
                                        <Edit3Icon className="w-8 h-8 opacity-50" aria-hidden="true" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="w-6 h-6 text-white" aria-hidden="true" />
                                </div>
                            </button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'avatars', 'avatar_url')}
                            />
                        </div>
                    </div>

                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={formData.full_name || ''}
                                autoComplete="name"
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username || ''}
                                autoComplete="username"
                                spellCheck={false}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profession">Profession</Label>
                            <Input
                                id="profession"
                                placeholder="e.g. AI Artist"
                                value={formData.profession || ''}
                                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Tokyo, Japan"
                                value={formData.location || ''}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                inputMode="url"
                                placeholder="https://..."
                                value={formData.website || ''}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                rows={3}
                                placeholder="Tell us about yourself…"
                                value={formData.bio || ''}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading || isUploading}>
                            {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
