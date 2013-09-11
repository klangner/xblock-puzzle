'''
Created on 08-09-2013

@author: Krzysztof Langner
'''
from cStringIO import StringIO
from pkg_resources import resource_string #@UnresolvedImport
from webob.response import Response
from xblock.core import XBlock, Scope
from xblock.fields import String, Integer
from xblock.fragment import Fragment
import Image
import cStringIO
import urllib
#from webob import Response


class PuzzleBlock(XBlock):
    """
    An XBlock providing puzzle activity based on given image
    """

    imageURL = String(help="Image URL", 
                      default="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Puzzle-historical-map-1639.JPG/320px-Puzzle-historical-map-1639.JPG", 
                      scope=Scope.content)
    width = Integer(help="Puzzle width", default=640, scope=Scope.content)
    height = Integer(help="Puzzle height", default=480, scope=Scope.content)
    cols = Integer(help="Number of columns", default=6, scope=Scope.content)
    rows = Integer(help="Number of rows", default=5, scope=Scope.content)
    
    def student_view(self, context):
        """
        Create a fragment used to display the XBlock to a student.
        `context` is a dictionary used to configure the display (unused)

        Returns a `Fragment` object specifying the HTML, CSS, and JavaScript
        to display.
        """
        html_str = resource_string(__name__, "static/puzzle/view.html")
        frag = Fragment(unicode(html_str))
        css_str = resource_string(__name__, "static/puzzle/puzzle.css")
        image_url = self.runtime.handler_url(self, 'image')
        frag.add_css(unicode(css_str % (image_url, self.width, self.height)))       
        frag.add_javascript_url('http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js') 
        js_str = resource_string(__name__, "static/puzzle/puzzle.js")
        frag.add_javascript(unicode(js_str % (self.width, self.height, self.cols, self.rows)))
        frag.initialize_js('PuzzleBlock')        
        return frag    
    
    @XBlock.json_handler
    def check(self, data):
        return {'response': 'ok'}    
    
    @XBlock.json_handler
    def show_answer(self, data):
        return {'response': 'ok'}    
    
    def image(self, request):
        """Provide shuffled image."""
        image_file = cStringIO.StringIO(urllib.urlopen(self.imageURL).read())
        img = Image.open(image_file)
        resized_img = img.resize((self.width, self.height), Image.ANTIALIAS)
        tmp = StringIO()
        resized_img.save(tmp, 'png')
        tmp.seek(0)
        response = Response()
        response.body = tmp.getvalue()
        response.headers['Content-Type'] = 'image/png'
        tmp.close()
        return response
    
    
@staticmethod
def workbench_scenarios():
    """A canned scenario for display in the workbench."""
    return [
        ("Puzzle demo",
        """\
            <vertical>
                <puzzle imageURL="upload/puzzle.png" cols="4" rows="5"/>
            </vertical>
         """)
    ]