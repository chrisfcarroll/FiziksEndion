/// <reference path="lib/underscore-typed.d.ts" />
/// <reference path="fiziksEndionVector.ts"/>

module FiziksEndion {

  _.sum = function (list) {
    return _.reduce(list, function (sumSoFar, nextValue) {
      return sumSoFar + nextValue;
    }, 0);
  };

}