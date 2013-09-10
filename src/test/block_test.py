# -*- coding: utf-8 -*-
'''
Created on 24-08-2013

@author: Krzysztof Langner
'''
from puzzle import PuzzleBlock
import unittest

class Test(unittest.TestCase):

    def testEmpty(self):
        block = PuzzleBlock(None, None, None)
        self.assertTrue(block)


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testTokenizer1']
    unittest.main()