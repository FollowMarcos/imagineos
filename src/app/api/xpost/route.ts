
import { NextRequest, NextResponse } from "next/server";

// Whitelist of allowed domains for X/Twitter images
const ALLOWED_DOMAINS = ["pbs.twimg.com", "abs.twimg.com"];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const TIMEOUT_MS = 10000; // 10 seconds

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const urlParam = searchParams.get("url");

    if (!urlParam) {
        return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
    }

    let targetUrl: URL;
    try {
        targetUrl = new URL(urlParam);
    } catch (e) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 1. Whitelist Validation
    if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
        return NextResponse.json(
            { error: "Domain not allowed. Only official Twitter image domains are supported." },
            { status: 403 }
        );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(targetUrl.toString(), {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        // 2. Size Cap Check (Content-Length header)
        const contentLength = response.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: "Image too large (exceeds 20MB limit)" },
                { status: 413 }
            );
        }

        // 3. Size Cap Check (Stream reading if header missing or unreliable)
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > MAX_SIZE_BYTES) {
            return NextResponse.json(
                { error: "Image too large (exceeds 20MB limit)" },
                { status: 413 }
            );
        }

        // Convert to Base64
        const base64String = Buffer.from(buffer).toString('base64');
        const contentType = response.headers.get("content-type") || "image/jpeg";

        return NextResponse.json({
            data: `data:${contentType};base64,${base64String}`
        });

    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            return NextResponse.json({ error: "Request timed out" }, { status: 504 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
