
import { ImageStitcher } from "@/components/tap-the-post/image-stitcher"

export const metadata = {
    title: "Stitcher | Tap The Post",
}

export default function StitcherPage() {
    return (
        <div className="w-full">
            <ImageStitcher />
        </div>
    )
}
