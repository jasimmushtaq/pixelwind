import math
from PIL import Image, ImageDraw, ImageFont
import os

def create_stamp():
    size = 1000
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    color = (0, 43, 73, 255) # #002B49
    
    # Draw rings
    draw.ellipse((50, 50, size-50, size-50), outline=color, width=12)
    draw.ellipse((65, 65, size-65, size-65), outline=color, width=4)
    draw.ellipse((270, 270, size-270, size-270), outline=color, width=6)
    
    # Try to load a font, otherwise use default
    try:
        font = ImageFont.truetype("arialbd.ttf", 60)
    except:
        font = ImageFont.load_default()
            
    text = "PIXELWIND TECHNOLOGIES VIZAG    *    "
    # We want to draw this text in a circle.
    radius = 380
    angle_step = 360 / len(text)
    
    for i, char in enumerate(text):
        # Calculate angle in radians
        # -90 to start at top. 
        angle_deg = i * angle_step - 90
        angle_rad = math.radians(angle_deg)
        
        # Position of the character center
        char_x = center + radius * math.cos(angle_rad)
        char_y = center + radius * math.sin(angle_rad)
        
        # Create a temporary image for the rotated character
        char_img = Image.new('RGBA', (150, 150), (255, 255, 255, 0))
        char_draw = ImageDraw.Draw(char_img)
        
        # Get bounding box for the character
        try:
            bbox = char_draw.textbbox((0,0), char, font=font)
        except:
            bbox = [0, 0, 40, 40]
        char_w = bbox[2] - bbox[0]
        char_h = bbox[3] - bbox[1]
        
        char_draw.text(((150-char_w)/2, (150-char_h)/2), char, font=font, fill=color)
        
        # Rotate the character (negative because Pillow rotates counter-clockwise)
        # Note: we add 90 so the bottom of the text points to the center
        char_rotated = char_img.rotate(-angle_deg - 90, resample=Image.BICUBIC, expand=True)
        
        # Paste it
        paste_x = int(char_x - char_rotated.width / 2)
        paste_y = int(char_y - char_rotated.height / 2)
        img.paste(char_rotated, (paste_x, paste_y), char_rotated)

    # Draw center text
    try:
        center_font = ImageFont.truetype("arial.ttf", 55)
    except:
        center_font = font
        
    center_text = "Date"
    try:
        bbox = draw.textbbox((0,0), center_text, font=center_font)
    except:
        bbox = [0,0, 100, 50]
    cw = bbox[2] - bbox[0]
    draw.text((center - cw/2 - 70, center - 60), center_text, font=center_font, fill=color)
    
    # Dotted line
    y_line = center
    start_x = center - 10
    end_x = center + 180
    dash_len = 10
    for x in range(int(start_x), int(end_x), int(dash_len * 2)):
        draw.line((x, y_line, x + dash_len, y_line), fill=color, width=4)

    os.makedirs("public", exist_ok=True)
    img.save("public/seal-highres.png")
    print("Saved public/seal-highres.png")

if __name__ == "__main__":
    create_stamp()
