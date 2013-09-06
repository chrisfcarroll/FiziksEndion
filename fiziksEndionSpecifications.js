var testCaseData = {
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

var testInitialBodies= [
  [testCaseData.newBody1()],
  [testCaseData.newBody1(), testCaseData.newBody2()],
  [testCaseData.newBody1(), testCaseData.newBody2(), testCaseData.newBody2(), testCaseData.newBody1()]
];

function doForAllTestInitialBodiesAndAges(callback){
  for(var i in testInitialBodies){
    var initialBodies= testInitialBodies[i];
    var testAges = testAges = [1, 9, 90];
    for(var j in  testAges){
      var age=testAges[j];

      callback(initialBodies,age);
    }
  }
}

describe("FiziksEndion - a simple mechanics and physics framework. Initialization.", function () {

  beforeEach(addFiziksEndionCustomMatchers);

  describe("Given a new universe", function () {
    for(var i in testInitialBodies){
      var initialBodies= testInitialBodies[i];

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
          expect(rf.currentMomentum()).vectorToBeCloseTo(totalOriginalMomentum);
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
            expect(JSON.stringify(agedRF.currentMomentum())).toBe(JSON.stringify(originalMomentum));
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
          var bodies = testCaseData.createBodies();
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