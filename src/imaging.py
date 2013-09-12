'''
Created on 2013-09-12

@author: Krzysztof Langner
'''
import Image
import logging

log = logging.getLogger(__name__)

def shuffle_image(image, order, rows, cols):
    piece_width = image.size[0]/cols
    piece_height = image.size[1]/rows
    shuffled_image = Image.new("RGB", image.size, "gray")
    (dest_col, dest_row) = (0, 0)
    
    for index in order:
        src_col = index%cols
        src_row = index/cols 
        src_box = (src_col*piece_width, src_row*piece_height, 
                   (src_col+1)*piece_width, (src_row+1)*piece_height)
        source = image.crop(src_box)
        dest_box = (dest_col*piece_width, dest_row*piece_height)
        shuffled_image.paste(source, dest_box)
        dest_col += 1
        if dest_col == cols:
            dest_col = 0
            dest_row += 1
    return shuffled_image
