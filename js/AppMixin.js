AppMixin = {
  getUniqueArray: function(array) {
    var temp = {};
    for (var i = 0; i < array.length; i++) {
      temp[array[i]] = array[i];
    }
    var c = [];
    for (var key in temp) {
      c.push(parseInt(key));
    }
    return c;
  }
}