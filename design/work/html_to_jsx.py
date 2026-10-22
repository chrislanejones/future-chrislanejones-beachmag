"""Convert a fragment of the static design's HTML into JSX for site/.

Usage: python3 work/html_to_jsx.py <in.html> > out.jsx-fragment
<style> and <script> blocks are dropped; port those by hand (CSS files and useEffect).
"""
import re
import sys
from html.parser import HTMLParser

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
RENAME = {
    'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'readonly': 'readOnly',
    'maxlength': 'maxLength', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'srcset': 'srcSet',
    'crossorigin': 'crossOrigin', 'autoplay': 'autoPlay', 'playsinline': 'playsInline',
    'enctype': 'encType', 'contenteditable': 'contentEditable', 'spellcheck': 'spellCheck',
    'autocomplete': 'autoComplete', 'fetchpriority': 'fetchPriority', 'referrerpolicy': 'referrerPolicy',
    'viewbox': 'viewBox', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace',
    'value': 'defaultValue', 'checked': 'defaultChecked', 'datetime': 'dateTime',
}
BOOLEAN = {'hidden', 'disabled', 'controls', 'open', 'multiple', 'required', 'defaultChecked', 'autoPlay', 'playsInline', 'loop', 'muted', 'readOnly'}
NUMERIC = {'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'tabIndex'}  # React types these as numbers
DROP = re.compile(r'^on[a-z]+$')  # inline handlers get ported by hand


def camel(name):
    if name.startswith(('aria-', 'data-')):
        return name
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), name)


def style_object(text):
    props = []
    for decl in text.split(';'):
        if ':' not in decl:
            continue
        key, val = decl.split(':', 1)
        key = key.strip()
        key = key if key.startswith('--') else camel(key)
        props.append(f'{key!r}: {val.strip()!r}'.replace("'", '"'))
    return '{{' + ', '.join(props) + '}}'


def text_jsx(text):
    text = re.sub(r'\s*\n\s*', ' ', text)
    return re.sub(r'[{}<>]', lambda m: "{'" + m.group() + "'}", text)


class Converter(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], None

    def handle_starttag(self, tag, attrs, closing=False):
        if self.skip:
            return
        if tag in ('style', 'script'):
            self.skip = tag
            return
        parts = []
        for name, value in attrs:
            if DROP.match(name):
                sys.stderr.write(f'dropped {name} on <{tag}>\n')
                continue
            jsx = RENAME.get(name, camel(name))
            if jsx == 'style':
                parts.append(f'style={style_object(value or "")}')
            elif jsx in NUMERIC and re.fullmatch(r'-?[0-9.]+', value or ''):
                parts.append(f'{jsx}={{{value}}}')
            elif value is None or (jsx in BOOLEAN and value in ('', jsx.lower())):
                parts.append(jsx)
            else:
                parts.append(f'{jsx}={{{value!r}}}' if '{' in value or '"' in value else f'{jsx}="{value}"')
        attr = (' ' + ' '.join(parts)) if parts else ''
        self.out.append(f'<{tag}{attr}{" />" if tag in VOID or closing else ">"}')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs, closing=True)

    def handle_endtag(self, tag):
        if self.skip:
            if tag == self.skip:
                self.skip = None
            return
        if tag not in VOID:
            self.out.append(f'</{tag}>')

    def handle_data(self, data):
        if not self.skip:
            self.out.append(text_jsx(data))


if __name__ == '__main__':
    c = Converter()
    c.feed(open(sys.argv[1], encoding='utf-8').read())
    print(''.join(c.out))
