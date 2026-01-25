
import { NextRequest, NextResponse } from "next/server";

// Whitelist of allowed domains for X/Twitter images
const ALLOWED_DOMAINS = ["pbs.twimg.com", "abs.twimg.com", "fxtwitter.com", "vxtwitter.com", "x.com", "twitter.com"];
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const TIMEOUT_MS = 15000; // 15 seconds

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    let urlParam = searchParams.get("url");

    if (!urlParam) {
        return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
    }

    console.log("[X-Fetch] Incoming URL:", urlParam);

    // Basic cleanup
    urlParam = urlParam.trim();
    if (!urlParam.startsWith("http")) urlParam = `https://${urlParam}`;

    let targetUrl: URL;
    try {
        targetUrl = new URL(urlParam);
    } catch (e) {
        console.error("[X-Fetch] Invalid URL format:", urlParam);
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 1. Handle X/Twitter Status Links
    if (targetUrl.hostname === "x.com" || targetUrl.hostname === "twitter.com") {
        try {
            // Attempt to use fxtwitter to get meta tags with image URls
            const fxUrl = `https://fxtwitter.com${targetUrl.pathname}`;
            console.log("[X-Fetch] Scraping via fxtwitter:", fxUrl);
            const fxRes = await fetch(fxUrl);
            const html = await fxRes.text();

            // Extract the og:image from meta tags
            const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
            console.log("[X-Fetch] og:image match result:", imgMatch ? "Found" : "Not Found");
            if (imgMatch && imgMatch[1]) {
                targetUrl = new URL(imgMatch[1]);
                console.log("[X-Fetch] Resolved image URL:", targetUrl.toString());
            } else {
                console.error("[X-Fetch] Meta tag extraction failed for:", fxUrl);
                return NextResponse.json({ error: "Could not find image in this post. Make sure it has an image." }, { status: 404 });
            }
        } catch (err) {
            console.error("[X-Fetch] Scraping error:", err);
            return NextResponse.json({ error: "Failed to scrape post data" }, { status: 500 });
        }
    }

    // 2. Final Whitelist Validation for the image domain
    const allowedImageDomains = ["pbs.twimg.com", "abs.twimg.com", "video.twimg.com", "fxtwitter.com", "vxtwitter.com"];
    if (!allowedImageDomains.some(domain => targetUrl.hostname.endsWith(domain))) {
        console.error("[X-Fetch] Domain restricted:", targetUrl.hostname);
        return NextResponse.json(
            { error: `Domain ${targetUrl.hostname} not allowed. Please provide a direct X/Twitter image link or post URL.` },
            { status: 403 }
        );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        console.log("[X-Fetch] Proxied fetch starting for:", targetUrl.toString());
        const response = await fetch(targetUrl.toString(), {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error("[X-Fetch] Remote server error:", response.status, response.statusText);
            return NextResponse.json(
                { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const buffer = await response.arrayBuffer();
        console.log("[X-Fetch] Fetch successful. Buffer size:", buffer.byteLength);
        if (buffer.byteLength > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: "Image too large" },
                { status: 413 }
            );
        }

        const base64String = Buffer.from(buffer).toString('base64');
        const contentType = response.headers.get("content-type") || "image/jpeg";

        return NextResponse.json({
            data: `data:${contentType};base64,${base64String}`
        });

    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error("[X-Fetch] Final catch error:", error);
        if (error.name === 'AbortError') {
            return NextResponse.json({ error: "Request timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
