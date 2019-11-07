const moment = require('moment')

module.exports = {
  'ifEquals': function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  },
  'ifNotEquals': function (arg1, arg2, options) {
    return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
  },
  moment: function (a) { // 呼叫 moment 並傳入一個時間參數 a
    return moment(a).fromNow()
  }
}