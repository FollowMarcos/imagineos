import { createClient } from "@/utils/supabase/server"
import LandingPageClient from "@/app/landing-page-client"
import AuthenticatedHome from "@/app/authenticated-home"

export default async function LandingPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single()

        return <AuthenticatedHome user={user} username={profile?.username || 'user'} fullName={profile?.full_name} />
    }

    return <LandingPageClient />
}
