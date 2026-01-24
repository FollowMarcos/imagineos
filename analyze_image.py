import colorgram
from PIL import Image
import colorsys

image_path = r"C:/Users/world/.gemini/antigravity/brain/4dcb888b-6b2b-46ff-99a5-320cea9d317f/uploaded_media_1769196996384.png"

def rgb_to_hsl(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
    return f"{h*360:.1f} {s*100:.1f}% {l*100:.1f}%"

try:
    # Extract 10 colors
    colors = colorgram.extract(image_path, 10)
    
    print("Extracted Colors (RGB -> HSL):")
    sorted_colors = sorted(colors, key=lambda c: c.hsl.l, reverse=True) # Sort by lightness

    for i, color in enumerate(sorted_colors):
        rgb = color.rgb
        hsl_val = rgb_to_hsl(rgb.r, rgb.g, rgb.b)
        print(f"Color {i}: RGB{rgb} -> HSL({hsl_val}) - Proportion: {color.proportion:.2f}")

    print("\nSUGGESTED MAPPING:")
    
    # Simple Heuristic
    background = sorted_colors[0] # Lightest
    foreground = sorted_colors[-1] # Darkest
    
    # Find most saturated for primary
    primary = max(colors, key=lambda c: c.hsl.s)
    
    print(f"Background: {rgb_to_hsl(background.rgb.r, background.rgb.g, background.rgb.b)}")
    print(f"Foreground: {rgb_to_hsl(foreground.rgb.r, foreground.rgb.g, foreground.rgb.b)}")
    print(f"Primary:    {rgb_to_hsl(primary.rgb.r, primary.rgb.g, primary.rgb.b)}")

except Exception as e:
    print(f"Error: {e}")
    # Fallback if colorgram fails
    try:
        img = Image.open(image_path)
        img = img.resize((150, 150))
        result = img.quantize(colors=10, method=2)
        palette = result.getpalette()
        # just print first few
        print("Fallback palette (first 3 RGB triples):", palette[:9])
    except Exception as e2:
        print(f"Fallback Error: {e2}")
