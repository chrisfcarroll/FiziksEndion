describe("FiziksEndion",function(){

  var body1InitialLocation={x:1,y:2,z:3};
  var body1InitialMomentum= {x:7,y:8,z:9};
  var mass1= 20;
  function newBody1(){
    return {mass: mass1, location: new Vector3(body1InitialLocation), momentum: new Vector3(body1InitialMomentum) };
  }

  var body2InitialLocation={x:1,y:2,z:3};
  var body2InitialMomentum= {x:7,y:8,z:9};
  var mass2= 20;
  function newBody2(){
    return {mass: mass2, location: new Vector3(body2InitialLocation), momentum: new Vector3(body2InitialMomentum) };
  }

  describe("Given a new universe", function(){

    var describeShouldInitialiseBodiesCorrectly = function(initialBodies){

      describe("with " + initialBodies.length + " bodies with initial momentum", function(){
        var originalBodyValues=[];
        initialBodies.forEach(function(b){
             originalBodyValues.push({mass:     b.mass,
                                 location: {x: b.location.x, y: b.location.y, z: b.location.z},
                                 momentum: {x:b.momentum.x, y: b.momentum.y, z: b.momentum.z}
                                });
          });

        var fe= new FiziksEndion(null, initialBodies);

        it("the universe momentum should equal the object's momentum", function(){
          var totalOriginalMomentum= Vector3.sum( initialBodies.map(function(el){return el.momentum;}) );
          expect(JSON.stringify(fe.momentum())).toBe( JSON.stringify(totalOriginalMomentum) );
        });

        it("the universe should start with the passed-in bodies", function(){

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

    describeShouldInitialiseBodiesCorrectly( [newBody1()] );
    describeShouldInitialiseBodiesCorrectly( [newBody1(),newBody2()] );
    describeShouldInitialiseBodiesCorrectly( [newBody1(),newBody2(),newBody2(),newBody1(), newBody2()] );
  });

  describe("Given a universe in which time has passed", function(){

    var age=0;
    var agedFe;

    describe("it should conserve momentum", function(){
      var itShouldGivenInitialBodiesAndAge= function (initialBodies, age) {
          it("Given age " + age + " with " + initialBodies.length + " initial bodies.", function(){
            var originalMomentum= Vector3.sum( initialBodies.map(function(b){return b.momentum;}) );
            agedFe= new FiziksEndion(null, initialBodies);
            agedFe.observer.age(age);
            expect(JSON.stringify(agedFe.momentum())).toBe(JSON.stringify(originalMomentum));
          });
      };
      itShouldGivenInitialBodiesAndAge([newBody1()], 1);
      itShouldGivenInitialBodiesAndAge([newBody1(), newBody2(), newBody2(), newBody1()],9);
    });

    describe("it should move bodies according to their momentum", function(){
      var itShouldGivenInitialBodiesAndAge= function(initialBodies,age){
          it("Given age " + age + " and " + initialBodies.length + " bodies.", function(){
            initialBodies.forEach(
              function(b){
                var expectedxd = b.location.x + age * b.momentum.x / b.mass;
                var expectedyd = b.location.y + age * b.momentum.y / b.mass;
                var expectedzd = b.location.z + age * b.momentum.z / b.mass;
                agedFe= new FiziksEndion(null, initialBodies);
                agedFe.observer.age(age);
                expect(JSON.stringify(b.location)).toBe(JSON.stringify(new Vector3(expectedxd, expectedyd, expectedzd)));
              }
            );
          });
      };
      itShouldGivenInitialBodiesAndAge([newBody1()],1);
      itShouldGivenInitialBodiesAndAge([newBody1(),newBody2(),newBody2(),newBody1()],20);
    });
  });

});