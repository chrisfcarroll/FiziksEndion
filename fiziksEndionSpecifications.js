var testCase = {
  newBody1: function () {
    var body1InitialLocation = {x: 1, y: 2, z: 3};
    var body1InitialMomentum = {x: 7, y: 8, z: 9};
    var mass1 = 20;
    return {mass: mass1, location: new Vector3(body1InitialLocation), momentum: new Vector3(body1InitialMomentum) };
  },

  newBody2: function () {
    var body2InitialLocation = {x: 1, y: 2, z: 3};
    var body2InitialMomentum = {x: 7, y: 8, z: 9};
    var mass2 = 20;
    return {mass: mass2, location: new Vector3(body2InitialLocation), momentum: new Vector3(body2InitialMomentum) };
  },

  createBodies: function () {
    return [this.newBody1(), this.newBody2()];
  }
};

describe("FizikEndion - a simple mechanics and physics framework. Initialization.", function () {

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
          expect(JSON.stringify(rf.totalMomentum())).toBe(JSON.stringify(totalOriginalMomentum));
        });

        it("the universe should start with the passed-in bodies", function () {

          expect(rf.bodies.length).toBe(initialBodies.length);

          rf.bodies.forEach(function (bodyi, i) {
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
    describeShouldInitialiseBodiesCorrectly([testCase.newBody1(), testCase.newBody2(), testCase.newBody2(), testCase.newBody1(), testCase.newBody2()]);
  });

});

describe("FizikEndion - Principle of Inertia.", function () {

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
          expect(JSON.stringify(agedRF.totalMomentum())).toBe(JSON.stringify(originalMomentum));
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
              expect(JSON.stringify(b.location)).toBe(JSON.stringify(new Vector3(expectedxd, expectedyd, expectedzd)));
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

  describe("Given forces obeying Newton's 2nd law, energy should be conserved.", function () {

    describe("Given an engine applying a constant force to a body", function () {

      var theMomentumShouldIncreaseByTheForce = function (rf, body1, timeInterval) {
        it("The momentum should increase by the force per unit time given time elapsed is " + timeInterval, function () {
          var initialMomentum = _.clone(body1.momentum);
          var force = body1.engines[0].force();
          rf.age(timeInterval);
          expect( JSON.stringify(body1.momentum) ).toBe( JSON.stringify(Vector3.add(initialMomentum, force)));
        });
      };

      var bodies = testCase.createBodies();
      new BigSelfPoweredEngine(1).attachTo(bodies[0]);
      var rfUnderTest= new ReferenceFrame(bodies);
      theMomentumShouldIncreaseByTheForce(rfUnderTest, rfUnderTest.bodies[0], 1);
    });
  });

});