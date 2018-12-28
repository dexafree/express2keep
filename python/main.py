import gkeepapi
from MyKeep import MyKeep
import os
import sys
from flask import Flask, request, abort
app = Flask(__name__)

gkeepapi.node.DEBUG = True

USERNAME = os.environ['EMAIL']
PASSWORD = os.environ['PASS']
MAC = os.environ['MAC']

SHOPLIST_TITLE = os.environ['NOTE_TITLE']

def log(msg):
    print '[INFO] ' + msg


def logError(msg):
    sys.stderr.write('[ERROR] ' + msg + '\n')


def doWork(elements):

    if len(elements) == 0:
        return

    keep = MyKeep(MAC)
    keep.login(USERNAME, PASSWORD)

    shopList = keep.find(func=lambda x: x.title == SHOPLIST_TITLE)
    found = False
    for note in shopList:
        found = True
        log('Found note: ' + str(note.id))
        log('Found note: ' + note.title)

        existing = []
        for item in note.items:
            if not item.checked:
                existing.append(item.text)

        for element in elements:
            if element not in existing:
                note.add(element, False)
                log('Added ' + element)
            else:
                log('Not adding {} because it already existed'.format(element))

    if found:
        log('Syncing')
        keep.sync()
        log('Synced')
    else:
        logError('Could not find any note with title [{}]'.format(SHOPLIST_TITLE))

    return found



@app.route('/elements', methods=['POST'])
def addElements():
    data = request.get_json()
    elements = data['elements']
    success = doWork(elements)
    if success:
        return 'OK'
    else:
        return abort(500)

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
