from PIL import Image
import sys

def make_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is black (or very close to black), make it transparent
        if item[0] < 20 and item[1] < 20 and item[2] < 20:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent logo to {output_path}")

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    make_transparent(input_file, output_file)
