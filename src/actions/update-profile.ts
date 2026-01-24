'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type ProfileUpdateData = {
    full_name?: string
    username?: string
    bio?: string
    profession?: string
    website?: string
    location?: string
    avatar_url?: string
    banner_url?: string
}

const profileSchema = z.object({
    full_name: z.string().max(100).optional(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric').optional(),
    bio: z.string().max(500).optional(),
    profession: z.string().max(100).optional(),
    website: z.string().url().refine((url) => url.startsWith('http://') || url.startsWith('https://'), "Must be a valid URL starting with http:// or https://").optional().or(z.literal('')),
    location: z.string().max(100).optional(),
    avatar_url: z.string().url().optional().or(z.literal('')),
    banner_url: z.string().url().optional().or(z.literal('')),
})

export async function updateProfile(userId: string, data: ProfileUpdateData) {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Unauthorized' }
    }

    // Identify user mismatch (if client sends userId different from auth user)
    // Although we use auth user for logic, good to catch this or just ignore the param.
    if (userId !== user.id) {
        return { error: 'Unauthorized operation' }
    }

    // Input Validation
    const parsed = profileSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }
    const cleanData = parsed.data

    // check if username is being updated and if it's unique
    if (cleanData.username) {
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', cleanData.username)
            .neq('id', user.id) // exclude current user
            .single()

        if (existingUser) {
            return { error: 'Username is already taken' }
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/p/[username]', 'page')
    return { success: true }
}
