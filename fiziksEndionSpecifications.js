var FE = FiziksEndion;
var Vector3= FE.Vector3;
var ReferenceFrame= FiziksEndion.ReferenceFrame;

var testCases = {

  bodyData: {
    newBody1: function () {
      var location = new Vector3(1, 2, 3);
      var momentum = new Vector3(7, 8, 9);
      var mass = 20;
      return {mass: mass, location: location, momentum: momentum};
    },

    newBody2: function () {
      var location = new Vector3(1, 2, 3);
      var momentum = new Vector3(7, 8, 9);
      var mass = 100;
      return {mass: mass, location: location, momentum: momentum};
    }
  },

  get initialBodies() {
    return [
      [this.bodyData.newBody1()],
      [this.bodyData.newBody1(), this.bodyData.newBody2()],
      [this.bodyData.newBody1(), this.bodyData.newBody2(), this.bodyData.newBody2(), this.bodyData.newBody1()]
    ];
  }
};

function doForAllTestInitialBodiesAndAges(callback){
  for(var i in testCases.initialBodies){
    var initialBodies= testCases.initialBodies[i];
    var testAges = testAges = [1, 9, 90];
    for(var j=0;j<testAges.length;j+=1){
      var age=testAges[j];

      callback(initialBodies,age);
    }
  }
}

describe("FiziksEndion - a simple mechanics and physics framework. Initialization.", function () {

  beforeEach(addFiziksEndionCustomMatchers);

  describe("Given a new universe", function () {

    var i, initialBodies;

    beforeEach(function(){
      initialBodies= testCases.initialBodies[i];
    });

    for(i in testCases.initialBodies){
      if(!testCases.initialBodies.hasOwnProperty(i)){continue;}

      initialBodies= testCases.initialBodies[i];

      describe("with " + initialBodies.length + " bodies with initial momentum", function () {
        var originalBodyValues = [];
        initialBodies.forEach(function (b) {
          originalBodyValues.push({mass: b.mass,
            location: {x: b.location.x, y: b.location.y, z: b.location.z},
            momentum: {x: b.momentum.x, y: b.momentum.y, z: b.momentum.z}
          });
        });

        it("the universe momentum should equal the object's momentum", function () {
          var totalOriginalMomentum
            = Vector3.sum(initialBodies.map(function (el) {return el.momentum;}));
          var rf = new ReferenceFrame(initialBodies);
          expect(rf.universe.totalMomentum()).vectorToBeCloseTo(totalOriginalMomentum);
        });

        it("the initial bodies should gain the methods needed to function as bodies added to them as properties.", function () {
          var rf = new ReferenceFrame(initialBodies);
          expect(rf.universe.bodies.length).toBe(initialBodies.length );
          rf.universe.bodies.forEach(function(b){
            expect(b.moveBy).toBe(FE.Body.moveBy);
            expect(b.velocity).toBe(FE.Body.velocity);
            expect(b.applyForce).toBe(FE.Body.applyForce);
          });
        });

        it("the universe should start with the passed-in bodies", function () {
          var rf = new ReferenceFrame(initialBodies);
          expect(rf.universe.bodies.length).toBe(initialBodies.length);
          rf.universe.bodies.forEach(function (bodyi, i) {
            expect(bodyi.mass).toBe(initialBodies[i].mass);
            expect(bodyi.location).vectorToBeCloseTo(initialBodies[i].location);
            expect(bodyi.location).vectorToBeCloseTo(initialBodies[i].location);
            expect(bodyi.momentum).vectorToBeCloseTo(initialBodies[i].momentum);
            expect(JSON.stringify(bodyi)).toBe(JSON.stringify(initialBodies[i]));
          });
        });
      });
    }

    describe("When existing javascript objects are used as bodies in the physics engine", function(){

      describe("Body.augment",function(){
        it("Should add properties to an object so it can function as a body in the physics engine", function () {
          var initialBody = FE.Body.augment({}, 1, new Vector3(1, 1, 1), Vector3.zero);
          var rf = new ReferenceFrame([initialBody]);
          expect(rf.universe.bodies.length).toBe(1);
          rf.universe.bodies.forEach(function (b) {
            expect(b.moveBy).toBe(FE.Body.moveBy);
            expect(b.velocity).toBe(FE.Body.velocity);
            expect(b.applyForce).toBe(FE.Body.applyForce);
          });
        });

        it("except it should throw if an initial body already has an incompatible function of the same name", function () {
          var initialBody = FE.Body.augment({}, 1, new Vector3(1, 1, 1), Vector3.zero);
          var rf = new ReferenceFrame([initialBody]);
          initialBody.moveBy = function (){};
          expect(function() { new ReferenceFrame([initialBody]); }).toThrow();
        });

        it("even if an initial body already has that function assigned.", function () {
          var initialBody = FE.Body.augment({}, 1, new Vector3(1, 1, 1), Vector3.zero);
          initialBody.moveBy = FE.Body.moveBy;
          var rf = new ReferenceFrame([initialBody]);
          rf.universe.bodies.forEach(function (b) {
            expect(b.moveBy).toBe(FE.Body.moveBy);
            expect(b.velocity).toBe(FE.Body.velocity);
            expect(b.applyForce).toBe(FE.Body.applyForce);
          });
        });

      });
    });

  });

});

describe("FiziksEndion - Principle of Inertia.", function () {

  beforeEach(addFiziksEndionCustomMatchers);

  describe("Given a universe in which time has passed", function () {

    describe("it should conserve momentum", function () {
      doForAllTestInitialBodiesAndAges(function(initialBodies,age){

          it("Given age " + age + " with " + initialBodies.length + " initial bodies.", function () {
            var originalMomentum
                = Vector3.sum(initialBodies.map(function (b) { return b.momentum; }));
            var agedRF = new ReferenceFrame(initialBodies);
            agedRF.age(age);
            expect(JSON.stringify(agedRF.universe.totalMomentum())).toBe(JSON.stringify(originalMomentum));
          })
        });
    });

    describe("it should apply momentum by moving bodies at constant velocity", function () {
      doForAllTestInitialBodiesAndAges(function (initialBodies, age) {

        it("Given age " + age + " and " + initialBodies.length + " bodies.", function () {
          initialBodies.forEach(
            function (b) {
              var expectedxd = b.location.x + age * b.momentum.x / b.mass;
              var expectedyd = b.location.y + age * b.momentum.y / b.mass;
              var expectedzd = b.location.z + age * b.momentum.z / b.mass;
              var agedRF = new ReferenceFrame(initialBodies);
              agedRF.age(age);
              expect("Expectations should work").toBe("Expectations should work");
              expect(b.location).vectorToBeCloseTo(new Vector3(expectedxd, expectedyd, expectedzd));
            }
          );
        });
      });
    });
  });
});


describe("FiziksEndion - Conservation of Energy", function () {

  beforeEach(addFiziksEndionCustomMatchers());

  var rfUnderTest;

  describe("Given forces obeying Newton's 2nd law, energy should be conserved.", function () {

    var theMomentumShouldIncreaseByTheIntegralOfTheForceWrtTime = function (timeInterval) {
      it("The momentum should increase by the force per unit time given time elapsed is " + timeInterval, function () {
        var body1= rfUnderTest.bodies[0];
        var initialMomentum = _.clone(body1.momentum);
        var force = body1.engines[0].force;
        rfUnderTest.age(timeInterval);
        expect(JSON.stringify(body1.momentum)).toBe(JSON.stringify( initialMomentum.add(force.timesScalar(timeInterval) )));
      });
    };

    var theEnginesEnergyDecreaseEqualKineticEnergyAddedPlusEntropyIncrease = function(timeInterval){
      it("the engine's energy decrease Should equal the kinetic energy added plus the entropy increase", function(){
        var body1= rfUnderTest.bodies[0];
        var initialEngineEnergy= body1.engines[0].energyStored();
        var initialEntropy= rfUnderTest.entropy();
        var initialKineticEnergy= rfUnderTest.universe.totalKineticEnergy();

        rfUnderTest.age(timeInterval);

        var finalEngineEnergy= body1.engines[0].energyStored();
        var finalEntropy= rfUnderTest.entropy();
        var finalKineticEnergy= rfUnderTest.universe.totalKineticEnergy();
        expectToBeStringifiedEqual(
          initialEngineEnergy+initialEntropy+initialKineticEnergy,
          finalEngineEnergy  +finalEntropy  +finalKineticEnergy
          );
      });
    }

    var theLocationShouldChangeByThePathIntegralOfTheForceAlongTheLocation = function (timeInterval, expected) {
      it("The momentum should increase by the force per unit time given time elapsed is " + timeInterval, function () {
        var body1= rfUnderTest.bodies[0];
        var initialLocation = _.clone(body1.location);
        rfUnderTest.age(timeInterval);
        expect(JSON.stringify(body1.location)).toBe(JSON.stringify(expected));
      });
    };

    function describeGivenAConstantForceApplied(timeInterval) {
      describe("Given a self powered engine applying a constant force to a body for more time", function () {

        beforeEach(function(){
          var bodies = testCases.bodyData.createBodies();
          new BigSelfPoweredConstantDirectionEngine(new Vector3(10, 11, 12)).attachTo(bodies[0]);
          rfUnderTest = new ReferenceFrame(bodies);
        });

        theMomentumShouldIncreaseByTheIntegralOfTheForceWrtTime(timeInterval);
        theEnginesEnergyDecreaseEqualKineticEnergyAddedPlusEntropyIncrease(timeInterval);
      });
    };

    //describeGivenAConstantForceApplied(1);
    //describeGivenAConstantForceApplied(9);

    describe("Current work in progress, tests not written.",function(){});

  });

});