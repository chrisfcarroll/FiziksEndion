_.sum= function(list){ return _.reduce(list, function(sumSoFar, nextValue){ return sumSoFar + nextValue; }, 0);};

function Vector3(x,y,z){
  if(typeof x === "object"){
    this.x= x.x;
    this.y= x.y;
    this.z= x.z;
  }else{
    this.x=x;
    this.y=y;
    this.z=z;
  }

  this.add = function(rightOperand){
      this.x += rightOperand.x;
      this.y += rightOperand.y;
      this.z += rightOperand.z;
      return this;
  };

  this.timesScalar=function(scalar){
    this.x *=scalar;
    this.y *=scalar;
    this.z *=scalar;
    return this;
  };
}

Vector3.add = function(left,right){
  return new Vector3(left.x + right.x, left.y + right.y, left.z + right.z);
};

Vector3.timesScalar = function(vector3,scalar){
  return new Vector3(vector3.x * scalar, vector3.y  * scalar, vector3.z  * scalar);
};

Vector3.sum = function(arrayOfVector3s){
  var totalx= 0, totaly= 0, totalz=0;
  arrayOfVector3s.forEach(function(el){
    totalx += el.x;
    totaly += el.y;
    totalz += el.z;
  });
  return new Vector3(totalx, totaly, totalz);
};


function Observer(objectsInUniverse){
  var time= 0;
  var objects=objectsInUniverse;

  var velocityOf= function(object){
    var x = object.momentum.x / object.mass;
    var y = object.momentum.y / object.mass;
    var z = object.momentum.z / object.mass;
    return new Vector3(x,y,z);
  };

  this.age=function(timeInterval){
    objects.forEach(function(o){
      o.location.add( velocityOf(o).timesScalar(timeInterval) );
    });
    time+=timeInterval;
  };
}


function FiziksEndion(forceFields,objects){
  this.forceFields = forceFields||[];
  this.bodies = objects||[];
  this.observer = new Observer(this.bodies);

  this.momentum=function(){
    var momentum= new Vector3(0,0,0);
    this.bodies.forEach(
      function(o){
        momentum.add(o.momentum);
      }
    );
    return momentum;
  };

}

