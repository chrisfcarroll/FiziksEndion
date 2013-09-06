describe("Vector3", function(){

 describe("static addition", function(){
   var left= new Vector3(1,2,3);
   var right= new Vector3(10,20,30);
   var result= left.add(right);

   it("should return a correctly added result", function(){
     expect(result.x).toBe(11);
     expect(result.y).toBe(22);
     expect(result.z).toBe(33);
   });

   it("should not mutate the left operand", function(){
     expect(left.x).toBe(1);
     expect(left.y).toBe(2);
     expect(left.z).toBe(3);
   });

   it("should not mutate the right operand", function(){
     expect(right.x).toBe(10);
     expect(right.y).toBe(20);
     expect(right.z).toBe(30);
   });

 });

  describe("static scalar multiplication", function(){

    var vector3= new Vector3(1,2,3);
    var scalar= 45.6;
    var result= vector3.timesScalar(scalar);

    it("should return a correctly scaled result", function(){
      expect(result.x).toBe(45.6);
      expect(result.y).toBe(91.2);
      expect(result.z).toBe(136.8);
    });

    it("should not mutate the vector operand", function(){
      expect(vector3.x).toBe(1);
      expect(vector3.y).toBe(2);
      expect(vector3.z).toBe(3);
    });
  });

  describe("sum of array", function(){
    var dataUnderTest= [new Vector3(1,2,3), new Vector3(10,20,30), new Vector3(100,200,300)];
    var result = Vector3.sum(dataUnderTest);

    it("should correctly sum the elements", function(){
      expect(JSON.stringify(result) ).toBe( JSON.stringify({x:111, y:222, z:333}) );
    });
  });

});