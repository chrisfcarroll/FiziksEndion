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

  this.magnitudeSquared=function(){
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  this.magnitude=function(){
    return Math.sqrt( this.magnitudeSquared() );
  };

  this.direction= function(){
    var size= this.magnitude();
    return new Vector3(this.x/size, this.y/size, this.z/size);
  };

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
  if(arguments.length==1){
    scalar=vector3;
    vector3=this;
  }
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

function BigSelfPoweredEngine(maxOutput){
  if(typeof maxOutput != 'number'){
    throw "BigSelfPoweredEngine(maxOutput) must be called with a maxOutput value.";
  }
  var attachedToBody;
  this.attachTo= function(body){
    attachedToBody=body;
    body.engines= body.engines||[this];
  }
  this.force= function(){return Vector3.timesScalar(attachedToBody.momentum.direction(), maxOutput);}
}

function Physics(forceFields){

  this.forceFields = forceFields||[];

  var principleOfInertia= {
    apply : function(bodies,timeInterval){
      bodies.forEach(function(unforcedBody){
        unforcedBody.location.incrementBy( Vector3.timesScalar(unforcedBody.momentum, timeInterval / unforcedBody.mass) );
      });
    },

    invariant : function(bodies){
      return bodies.totalMomentum();
    }

  };

  var lawOfConservationOfEnergy= {
    apply : function(bodies, timeInterval){
      _.filter(bodies, function(body){return body.engines!=undefined;})
       .forEach(function(body){
          body.engines.forEach(function(engine){
            var initialKineticEnergy= lawOfConservationOfEnergy.kineticEnergy(body);
            body.location.incrementBy( Vector3.timesScalar(engine.force(), timeInterval * timeInterval / body.mass / 2) );
            body.momentum.incrementBy( Vector3.timesScalar( engine.force(), timeInterval ) );
            energyUsed=lawOfConservationOfEnergy.kineticEnergy(body) - initialKineticEnergy;
          });
        });
    },

    invariant : function(engines, bodies){
      return _sum(bodies.map(function(body){  return lawOfConservationOfEnergy.kineticEnergy(body); }));
    },

    kineticEnergy : function(body){
      return body.momentum.magnitudeSquared()  / body.mass / 2;
    }
  };


  this.timeInvariants= [ principleOfInertia, lawOfConservationOfEnergy ];
  this.principleOfInertia= principleOfInertia;
  this.lawOfConservationOfEnergy= lawOfConservationOfEnergy;
}

function ReferenceFrame(bodies, physics){
  var physics= physics || new Physics([]);
  var bodies= bodies||[];
  var time= 0;
  this.bodies=bodies;

  bodies.totalMomentum=function(){
    return Vector3.sum( bodies.map(function(b){return b.momentum;}) );
  };

  this.age=function(timeInterval){
    if (timeInterval!==undefined){
      physics.timeInvariants.forEach(function(invariant){
        invariant.apply(bodies,timeInterval);
      });
      time+=timeInterval;
    }
    return time;
  };

  this.totalMomentum=bodies.totalMomentum;
}

