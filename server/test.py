##############################################################################
import time
import pykeyboard #https://github.com/SavinaRoja/PyUserInput

##############################################################################
#print('Activate the application 3 seconds.')
#time.sleep(3)

##############################################################################
k = pykeyboard.PyKeyboard()
k.press_key('s')
time.sleep(0.1)
k.release_key('s')