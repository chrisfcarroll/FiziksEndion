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