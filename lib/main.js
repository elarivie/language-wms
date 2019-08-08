exports.activate = function() {
  if (!atom.grammars.addInjectionPoint) return

  atom.grammars.addInjectionPoint('source.wms', {
    type: 'heredoc_body',
    language (node) { return node.lastChild.text },
    content (node) { return node }
  })

  atom.grammars.addInjectionPoint('source.wms', {
    type: 'regex',
    language () { return 'regex' },
    content (node) { return node }
  })
}
