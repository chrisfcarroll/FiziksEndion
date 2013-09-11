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

var toBeCloseToP =  function() {
  return {
    compare: function(actual, expected, precision) {

      if (precision !== 0) {
        precision = precision || 2;
      }
      with(Math){
        var scale= 1 + log(min( abs(expected),abs(actual)))/LN10;
        var pass = abs(expected - actual) < ( pow(10, scale-precision) / 2);
      }

      return {
        pass : pass,
        message : "Expected " + JSON.stringify(actual) + (pass?" not ":"") + "to match " + JSON.stringify(expected) + " with proportional precision " + precision
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

var vectorToBeCloseToP= function(){
  var defaultRequiredPrecision=14;
  return {
    compare: function (actual, expected,precision) {
      var precision= precision!==undefined ? precision : defaultRequiredPrecision;
      var xOk= toBeCloseToP().compare(actual.x,expected.x,precision).pass;
      var yOk= toBeCloseToP().compare(actual.y,expected.y,precision).pass;
      var zOk= toBeCloseToP().compare(actual.z,expected.z,precision).pass;
      var not= this.isNot ? " not" : "";
      var pass= xOk && yOk && zOk;
      return {
        pass: pass,
        message : "Expected " + JSON.stringify(actual) + (pass?" not ":"") + "to match " + JSON.stringify(expected) + " with proportionate precision " + precision
      };
    }
  };
};

var addFiziksEndionCustomMatchers = function () {
  addMatchers({
    toBeStringifyEqualTo: toBeStringifyEqualTo,
    toBeCloseToP : toBeCloseToP,
    vectorToBeCloseTo: vectorToBeCloseTo,
    vectorToBeCloseToP: vectorToBeCloseToP
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

describe("toBeCloseToP", function () {
  [
    [1.1, 1.1, 0],
    [123456789, 123456300, 6],
    [123.456789, 123.456300, 6],
    [123.456789e100, 123.456300e100, 6],
    [123.456789e-100, 123.456300e-100, 6]
  ].forEach(function (testCase) {
      var actual= testCase[0];
      var expected= testCase[1];
      var precision=testCase[2];
      it( "" + actual + " Should be evaluated as CloseToP " + expected + " with precision " + precision, function () {
        var result= toBeCloseToP().compare(actual,expected,precision);
        expect(result.pass).toBeTruthy();
      });
    });

  [
    [1, 2,  1],
    [1, 2, 20],
    [123456789, 123456300, 7],
    [123.456789, 123.456300, 7],
    [123.456789e100, 123.456300e100, 7],
    [123.456789e-100, 123.456300e-100, 7]
  ].forEach(function (testCase) {
      var actual= testCase[0];
      var expected= testCase[1];
      var precision=testCase[2];
      it( "" + actual + " Should be evaluated as not CloseToP " + expected + " with precision " + precision, function () {
        var result= toBeCloseToP().compare(actual,expected,precision);
        expect(result.pass).toBeFalsy();
      });
    });

});