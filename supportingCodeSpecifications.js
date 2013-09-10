var toBeStringifyEqualTo= function () {
  return {
    compare: function (actual, expected) {
      var sActual = JSON.stringify(actual);
      var sExpected = JSON.stringify(expected);
      return {
        pass: sActual == sExpected
      };
    }
  };
};

var vectorToBeCloseTo= function(){
  var defaultRequiredPrecision=14;
  return {
    compare: function (actual, expected,precision) {
      var precision= precision!==undefined ? precision : defaultRequiredPrecision;
      var xOk= window.j$.matchers.toBeCloseTo().compare(actual.x,expected.x,precision).pass;
      var yOk= window.j$.matchers.toBeCloseTo().compare(actual.y,expected.y,precision).pass;
      var zOk= window.j$.matchers.toBeCloseTo().compare(actual.z,expected.z,precision).pass;
      var not= this.isNot ? " not" : "";
      var pass= xOk && yOk && zOk;
      return {
        pass: pass,
        message : "Expected " + JSON.stringify(actual) + (pass?" not ":"") + "to match " + JSON.stringify(expected) + " with precision " + precision
      };
    }
  };
};

var addFiziksEndionCustomMatchers = function () {
  addMatchers({
    toBeStringifyEqualTo: toBeStringifyEqualTo,
    vectorToBeCloseTo: vectorToBeCloseTo
  });
};


describe("_.sum()", function(){
  it("should sum the elements given a numeric array", function(){
    var result=_.sum([1,20,300,4000]);
    expect(result).toBe(4321);
  });
  it("should return 0 given an empty array", function(){
    var result=_.sum( [] );
    expect(result).toBe(0);
  });
});
