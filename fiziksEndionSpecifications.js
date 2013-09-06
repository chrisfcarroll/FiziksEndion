// interim solution while I haven't got Jasmine 2 addMatchers() working
var expectToBeStringifiedEqual= function(actual,expected){
  return expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
}

var expectVectorsToMatchWithPrecision10 = function(left, right){
 expect(left.x).toBeCloseTo(right.x, 10);
 expect(left.y).toBeCloseTo(right.y, 10);
 expect(left.z).toBeCloseTo(right.z, 10);
}

var testCase = {
  newBody1: function () {
    var location = new Vector3(1,2,3);
    var momentum = new Vector3(7,8,9);
    var mass = 20;
    return new Body(mass,location,momentum);
  },

  newBody2: function () {
    var location = new Vector3(1,2,3);
    var momentum = new Vector3(7,8,9);
    var mass = 100;
    return new Body(mass,location,momentum);
  },

  createBodies: function () {
    return [this.newBody1(), this.newBody2()];
  }
};



describe("FiziksEndion - a simple mechanics and physics framework. Initialization.", function () {


  describe("Given a new universe", function () {

    var describeShouldInitialiseBodiesCorrectly = function (initialBodies) {

      describe("with " + initialBodies.length + " bodies with initial momentum", function () {
        var originalBodyValues = [];
        initialBodies.forEach(function (b) {
          originalBodyValues.push({mass: b.mass,
            location: {x: b.location.x, y: b.location.y, z: b.location.z},
            momentum: {x: b.momentum.x, y: b.momentum.y, z: b.momentum.z}
          });
        });

        var rf = new ReferenceFrame(initialBodies);

        it("the universe momentum should equal the object's momentum", function () {
          var totalOriginalMomentum = Vector3.sum(initialBodies.map(function (el) {
            return el.momentum;
          }));
          expectToBeStringifiedEqual(rf.currentMomentum() ,totalOriginalMomentum);
        });

        it("the universe should start with the passed-in bodies", function () {

          expect(rf.universe.bodies.length).toBe(initialBodies.length);

          rf.universe.bodies.forEach(function (bodyi, i) {
            expect(bodyi.mass).toBe(initialBodies[i].mass);
            expect(bodyi.location.x).toBe(initialBodies[i].location.x);
            expect(bodyi.location.y).toBe(initialBodies[i].location.y);
            expect(bodyi.location.z).toBe(initialBodies[i].location.z);
            expect(bodyi.momentum.x).toBe(initialBodies[i].momentum.x);
            expect(bodyi.momentum.y).toBe(initialBodies[i].momentum.y);
            expect(bodyi.momentum.z).toBe(initialBodies[i].momentum.z);
            expect(JSON.stringify(bodyi)).toBe(JSON.stringify(initialBodies[i]));
          });
        });

      })
    };

    describeShouldInitialiseBodiesCorrectly([testCase.newBody1()]);
    describeShouldInitialiseBodiesCorrectly([testCase.newBody1(), testCase.newBody2()]);
    describeShouldInitialiseBodiesCorrectly([testCase.newBody1(), testCase.newBody2(), testCase.newBody2(),
                                             testCase.newBody1(), testCase.newBody2()]);
  });

});

describe("FiziksEndion - Principle of Inertia.", function () {

  describe("Given a universe in which time has passed", function () {

    var age = 0;
    var agedRF;

    describe("it should conserve momentum", function () {

      var itShouldGivenInitialBodiesAndAge = function (initialBodies, age) {
        it("Given age " + age + " with " + initialBodies.length + " initial bodies.", function () {
          var originalMomentum = Vector3.sum(initialBodies.map(function (b) {
            return b.momentum;
          }));
          agedRF = new ReferenceFrame(initialBodies);
          agedRF.age(age);
          expect(JSON.stringify(agedRF.currentMomentum())).toBe(JSON.stringify(originalMomentum));
        });
      };

      itShouldGivenInitialBodiesAndAge([testCase.newBody1()], 1);
      itShouldGivenInitialBodiesAndAge([testCase.newBody1(), testCase.newBody2(), testCase.newBody2(), testCase.newBody1()], 9);
    });

    describe("it should apply momentum by moving bodies at constant velocity", function () {

      var itShouldGivenInitialBodiesAndAge = function (initialBodies, age) {
        it("Given age " + age + " and " + initialBodies.length + " bodies.", function () {
          initialBodies.forEach(
            function (b) {
              var expectedxd = b.location.x + age * b.momentum.x / b.mass;
              var expectedyd = b.location.y + age * b.momentum.y / b.mass;
              var expectedzd = b.location.z + age * b.momentum.z / b.mass;
              agedRF = new ReferenceFrame(initialBodies);
              agedRF.age(age);
              expectVectorsToMatchWithPrecision10(b.location, new Vector3(expectedxd, expectedyd, expectedzd));
            }
          );
        });
      };

      itShouldGivenInitialBodiesAndAge([testCase.newBody1()], 1);
      itShouldGivenInitialBodiesAndAge([testCase.newBody1(), testCase.newBody2(), testCase.newBody2(), testCase.newBody1()], 20);
    });
  });
});

describe("FiziksEndion - Conservation of Energy", function () {

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
        var initialKineticEnergy= rfUnderTest.currentKineticEnergy();

        rfUnderTest.age(timeInterval);

        var finalEngineEnergy= body1.engines[0].energyStored();
        var finalEntropy= rfUnderTest.entropy();
        var finalKineticEnergy= rfUnderTest.currentKineticEnergy();
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
          var bodies = testCase.createBodies();
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