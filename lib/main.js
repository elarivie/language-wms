exports.activate = function() {
  if (!atom.grammars.addInjectionPoint) return

  atom.grammars.addInjectionPoint('source.wms', {
    type: 'call_expression'
    language () { return 'wms' },
    content (node) { return node }
  })
}
