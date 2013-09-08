'''
Created on 08-09-2013

@author: Krzysztof Langner
'''
from xblock.core import XBlock, Scope
from xblock.fields import String, Integer
from xblock.fragment import Fragment
from pkg_resources import resource_string #@UnresolvedImport


class PuzzleBlock(XBlock):
    """
    An XBlock providing puzzle activity based on given image
    """

    image_path = String(help="Image path", default=None, scope=Scope.content)
    cols = Integer(help="Numer of columns", default=4, scope=Scope.content)
    rows = Integer(help="Number of rows", default=4, scope=Scope.content)
    
    def student_view(self, context):
        """
        Create a fragment used to display the XBlock to a student.
        `context` is a dictionary used to configure the display (unused)

        Returns a `Fragment` object specifying the HTML, CSS, and JavaScript
        to display.
        """
        html_str = resource_string(__name__, "static/student.html")
        frag = Fragment(unicode(html_str).format(self=self))
        return frag    


@staticmethod
def workbench_scenarios():
    """A canned scenario for display in the workbench."""
    return [
        ("Puzzle demo",
        """\
            <vertical>
                <puzzle image="upload/puzzle.png" cols="4" rows="5"/>
            </vertical>
         """)
    ]