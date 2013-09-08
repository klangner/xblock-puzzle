'''
Created on 08-09-2013

@author: Krzysztof Langner
'''
from setuptools import setup

setup(
    name='xblock-puzzle',
    version='0.1',
    description='Puzzle activity',
    py_modules=['puzzle'],
    install_requires=['XBlock'],
    entry_points={
        'xblock.v1': [
            'puzzle = puzzle:PuzzleBlock',
        ]
    }
)