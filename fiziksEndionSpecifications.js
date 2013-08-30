describe("FiziksEndion",function(){

  describe("Given a new universe", function(){
    
    var shouldInitialiseBodiesCorrectly = function(description, initialBodies){

      describe(description, function(){
        var initialValues=[];
        initialBodies.forEach(function(b){
             initialValues.push({mass:     b.mass,
                                 location: {x: b.location.x, y: b.location.y, z: b.location.z},
                                 momentum: {x:b.momentum.x, y: b.momentum.y, z: b.momentum.z}
                                });
          });

        var fe= new FiziksEndion(null, initialBodies);

        it("the universe momentum should equal the object's momentum", function(){
          var totalInitialMomentum= Vector3.sum( initialBodies.map(function(el){return el.momentum;}) );
          expect(JSON.stringify(fe.momentum())).toBe( JSON.stringify(totalInitialMomentum) );
        });

        it("the universe should start with the passed-in body", function(){

          expect(fe.bodies.length).toBe(initialBodies.length);

          fe.bodies.forEach(function(bodyi, i){
            expect( bodyi.mass).toBe( initialBodies[i].mass);
            expect( bodyi.location.x).toBe(initialBodies[i].location.x);
            expect( bodyi.location.y).toBe(initialBodies[i].location.y);
            expect( bodyi.location.z).toBe(initialBodies[i].location.z);
            expect( bodyi.momentum.x).toBe(initialBodies[i].momentum.x);
            expect( bodyi.momentum.y).toBe(initialBodies[i].momentum.y);
            expect( bodyi.momentum.z).toBe(initialBodies[i].momentum.z);
            expect( JSON.stringify(bodyi)).toBe( JSON.stringify(initialBodies[i] ));
          });
        });

      })
    };

    var initialLocation1={x:1,y:2,z:3};
    var initialMomentum1= {x:7,y:8,z:9};
    var mass1= 20;
    shouldInitialiseBodiesCorrectly(
      "with one body with initial momentum",
      [{mass: mass1, location: new Vector3(initialLocation1), momentum: new Vector3(initialMomentum1) }]
      );

    var initialLocation2={x:1,y:2,z:3};
    var initialMomentum2= {x:7,y:8,z:9};
    var mass2= 20;
    shouldInitialiseBodiesCorrectly(
      "with two bodies with initial momentum",
      [
        {mass: mass1, location: new Vector3(initialLocation1), momentum: new Vector3(initialMomentum1) },
        {mass: mass2, location: new Vector3(initialLocation2), momentum: new Vector3(initialMomentum2) }
      ]
    );



    describe("Given a universe in which time has passed", function(){

      var age=0;
      var agedFe;

      beforeEach(function(){
        agedFe= new FiziksEndion(null, [ {mass:mass1, location: new Vector3(initialLocation1), momentum:new Vector3(initialMomentum1) } ]);
      });

      describe("should conserve momentum", function(){

        function assertMomentumWasConservedAfterAging(){
          agedFe.observer.age(age);
          expect(JSON.stringify(agedFe.momentum())).toBe( JSON.stringify(initialMomentum1) );
        }

        it("Given time passed=1", function(){
          age=1;
          assertMomentumWasConservedAfterAging();
        });

        it("Given time passed=9", function(){
          age=9;
          assertMomentumWasConservedAfterAging();
        });

      });

      describe("should move bodies according to their momentum", function(){

        function assertObjectWasMovedAsExpectedAfterAging(){
          agedFe.observer.age(age);
          var object1= agedFe.bodies[0];
          var expectedxd= initialLocation1.x + age * initialMomentum1.x / mass1;
          var expectedyd= initialLocation1.y + age * initialMomentum1.y / mass1;
          var expectedzd= initialLocation1.z + age * initialMomentum1.z / mass1;
          expect(JSON.stringify(object1.location)).toBe( JSON.stringify( new Vector3( expectedxd, expectedyd, expectedzd) ) );
        }

        it("Given time passed=1", function(){
          age=1;
          assertObjectWasMovedAsExpectedAfterAging();
        });

        it("Given time passed=9", function(){
          age=9;
          assertObjectWasMovedAsExpectedAfterAging();
        });

      });
    });
  });
  
});