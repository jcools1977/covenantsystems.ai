"""Convert our public HTML into a text alternative; omit forms and decorative markup."""
from html.parser import HTMLParser
import re
import sys


class Markdown(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.output = []
        self.skip = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if self.skip:
            if tag not in {'img', 'input', 'meta', 'link', 'br', 'hr'}:
                self.skip.append(tag)
            return
        if tag in {'head', 'script', 'style', 'svg', 'canvas', 'form', 'button'} or 'hidden' in attrs or attrs.get('aria-hidden') == 'true':
            self.skip.append(tag)
            return
        if tag in {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
            self.output.append('\n\n' + '#' * int(tag[1]) + ' ')
        elif tag in {'p', 'section', 'article', 'header', 'footer', 'nav', 'dl', 'dt', 'dd', 'summary'}:
            self.output.append('\n\n')
        elif tag == 'li':
            self.output.append('\n- ')
        elif tag == 'br':
            self.output.append('\n')
        elif tag == 'a':
            self.links.append(attrs.get('href', ''))
            self.output.append('[')
        elif tag == 'img' and attrs.get('alt'):
            self.output.append(attrs['alt'])

    def handle_endtag(self, tag):
        if self.skip:
            if tag == self.skip[-1]:
                self.skip.pop()
            return
        if tag == 'a' and self.links:
            self.output.append('](' + self.links.pop() + ')')
        if tag in {'p', 'h1', 'h2', 'h3', 'h4', 'section', 'article', 'header', 'footer', 'nav', 'li', 'dd', 'summary'}:
            self.output.append('\n\n')

    def handle_data(self, text):
        if not self.skip:
            self.output.append(re.sub(r'\s+', ' ', text))

    def render(self, html):
        self.feed(html)
        text = ''.join(self.output)
        text = re.sub(r'[ \t]+\n', '\n', text)
        text = re.sub(r'\n[ \t]+', '\n', text)
        return re.sub(r'\n{3,}', '\n\n', text).strip() + '\n'


if __name__ == '__main__':
    sys.stdout.write(Markdown().render(sys.stdin.read()))
