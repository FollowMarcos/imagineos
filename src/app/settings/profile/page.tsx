import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form"

export const metadata = {
    title: "Profile Settings | ImagineOS",
    description: "Customize your public identity on ImagineOS.",
}

export default async function ProfileSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error || !profile) {
        // This shouldn't happen for an authenticated user with RLS and our setup
        // But let's handle it gracefully or redirect
        redirect('/')
    }

    return (
        <ProfileSettingsForm profile={profile} />
    )
}
