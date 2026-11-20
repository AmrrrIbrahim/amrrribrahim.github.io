// Wraps every level-2 heading in Markdown, together with everything that
// follows it up to the next level-2 heading, in a <section>. That gives
// Markdown pages (About, Contact, legal pages) the same section structure as
// the hand-built pages, so the fade-in and the left-column highlight work.
export function wrapSections() {
  return (tree) => {
    const out = [];
    let current = null;
    for (const node of tree.children) {
      if (node.type === 'element' && node.tagName === 'h2') {
        current = {
          type: 'element',
          tagName: 'section',
          properties: { className: ['md-section'] },
          children: [node],
        };
        out.push(current);
      } else if (current) {
        current.children.push(node);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}
