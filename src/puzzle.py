'''
Created on 08-09-2013

@author: Krzysztof Langner
'''
from cStringIO import StringIO
from imaging import shuffle_image
from pkg_resources import resource_string #@UnresolvedImport
from webob.response import Response
from xblock.core import XBlock, Scope
from xblock.fields import String, Integer, List
from xblock.fragment import Fragment
import Image
import cStringIO
import json
import random
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
    order = List(help="Correct order of elements", default=[], scope=Scope.user_state)
    
    def student_view(self, context):
        self.order = random.shuffle(list(range(self.rows*self.cols)))
        html_str = resource_string(__name__, "static/puzzle/view.html")
        frag = Fragment(unicode(html_str).format(data=self._json_params()))
        frag.add_css(unicode(resource_string(__name__, "static/puzzle/puzzle.css")))       
        frag.add_javascript_url('http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min.js') 
        frag.add_javascript(unicode(resource_string(__name__, "static/puzzle/puzzle.js")))
        frag.initialize_js('PuzzleBlock')        
        return frag   
    
    def _json_params(self):
        return json.dumps({
                           'image': self.runtime.handler_url(self, 'image'),
                           'width': self.width,
                           'height': self.height,
                           'rows': self.rows,
                           'columns': self.cols,
                           })
        
    @XBlock.json_handler
    def check(self, data):
        score = 0
        errors = []
        if len(data) == len(self.order):
            for index in range(len(self.order)):
                if data[index] != self.order[index]:
                    errors.append(index)
            if len(errors) == 0: 
                score = 1
        return {'score': score, 'errors': errors}    
    
    def image(self, request):
        """Provide shuffled image."""
        image_file = cStringIO.StringIO(urllib.urlopen(self.imageURL).read())
        img = Image.open(image_file)
        resized_img = img.resize((self.width, self.height), Image.ANTIALIAS)
        shuffled_image = shuffle_image(resized_img, self.order, self.rows, self.cols)
        tmp = StringIO()
        shuffled_image.save(tmp, 'png')
        tmp.seek(0)
        response = Response()
        response.body = tmp.getvalue()
        response.headers['Content-Type'] = 'image/png'
        response.headers['Cache-Control'] = 'max-age=0'
        tmp.close()
        return response
    
    
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench.
            2 modules:
            <vertical>
                <puzzle imageURL="http://www.bluenotepad.com/media/images/welcome.jpg" cols="4" rows="5"/>
                <puzzle imageURL="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Puzzle-historical-map-1639.JPG/320px-Puzzle-historical-map-1639.JPG" cols="4" rows="5"/>
            </vertical>
        """
        return [
            ("Puzzle demo",
            """\
                <vertical>
                    <puzzle imageURL="http://farm6.staticflickr.com/5443/9723034563_1b65b43195_c.jpg" cols="2" rows="2"/>
                </vertical>
             """)
        ]