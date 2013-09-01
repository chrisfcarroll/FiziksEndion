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

  this.incrementBy = function(rightOperand){
      this.x += rightOperand.x;
      this.y += rightOperand.y;
      this.z += rightOperand.z;
      return this;
  };

  this.scaleBy=function(scalar){
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

/*
 * Represents a body as seen from a reference frame
 */
function Body(mass,location,momentum){
  this.mass=mass;
  this.location=location;
  this.momentum=momentum;
  this.velocity=function(){return Vector3.timesScalar(this.momentum, 1.0/this.mass);}
}

function Physics(forceFields){

  this.forceFields = forceFields||[];

  var principleOfInertia= function(unforcedBody,timeInterval){
      unforcedBody.location.incrementBy( Vector3.timesScalar(unforcedBody.momentum, timeInterval / unforcedBody.mass) );
  };

  this.timeInvariants= [ principleOfInertia ];
}

function ReferenceFrame(bodies, physics){
  var physics= physics || new Physics([]);
  var bodies=bodies||[];
  var time= 0;

  this.bodies=function(){return bodies;};

  this.age=function(timeInterval){
    if (timeInterval!==undefined){
      bodies.forEach(function(body){
        physics.timeInvariants.forEach(function(invariant){
          invariant(body,timeInterval);
        });
      });
      time+=timeInterval;
    }
    return time;
  };

  this.totalMomentum=function(){
    return Vector3.sum(
      bodies.map(function(b){return b.momentum;})
    );
  };
}

