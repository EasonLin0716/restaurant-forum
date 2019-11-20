module.exports = {
  add: function(a, b) {
    if (isNaN(a) || isNaN(b)) {
      throw new Error('args must be numbers')
    }
    return a + b
  }
}
