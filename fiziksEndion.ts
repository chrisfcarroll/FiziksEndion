/// <reference path="lib/underscore-typed.d.ts" />

_.sum = function (list) {
  return _.reduce(list, function (sumSoFar, nextValue) {
    return sumSoFar + nextValue;
  }, 0);
};

class Vector3 {

  constructor(public x:number, public y:number, public z:number){}

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  magnitude() {
    return Math.sqrt(this.magnitudeSquared());
  }

  direction() {
    var size = this.magnitude();
    return new Vector3(this.x / size, this.y / size, this.z / size);
  }

  timesScalar(scalar:number) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  add(right) {
    return new Vector3(this.x + right.x, this.y + right.y, this.z + right.z);
  }

  static zero = new Vector3(0,0,0);

  static sum = function (arrayOfVector3s) {
    var totalx = 0, totaly = 0, totalz = 0;
    arrayOfVector3s.forEach(function (el) {
      totalx += el.x;
      totaly += el.y;
      totalz += el.z;
    });
    return new Vector3(totalx, totaly, totalz);
  };

}

/*
 * Represents a body as seen from a reference frame
 */
interface Body {

  mass : number;
  location : Vector3;
  momentum: Vector3;

  velocity() : Vector3;
  moveBy(vector: Vector3);
  applyForce(force: Vector3, timeInterval: number);
}

var bodyRoot= {
  momentum: Vector3.zero,

  velocity : function() {
    return this.momentum.timesScalar(1.0 / this.mass);
  },

  moveBy : function(vector: Vector3){
    this.location= this.location.add(vector);
  },

  applyForce : function(force: Vector3, timeInterval: number){
    this.moveBy(force.timesScalar(timeInterval * timeInterval / this.mass / 2));
    this.momentum= this.momentum.add(force.timesScalar(timeInterval));
  }
};


class Universe {
  constructor(public bodies:Body[], private _physics: Physics = Physics.Current, public entropy:number=0){}

  public totalMomentum() {
    return this._physics.principleOfInertia.invariant(this);
  }

  public totalKineticEnergy() {
    return this._physics.lawOfConservationOfEnergy.invariant(this);
  }
}

interface Engine {
  attachedBody : Body;
  energyStored : number;
  force: Vector3;
  applyForce(timeInterval:number);
}

class BigSelfPoweredConstantDirectionEngine {
  attachedBody : Body;
  energyStored : number;
  force: Vector3;

  constructor(force:Vector3 = Vector3.zero, initialEnergy:number = 0) {}

  attachTo(body) {
    this.attachedBody = body;
    body.engines = body.engines || [this];
  }

  applyForce(timeInterval) {
    if (this.attachedBody) {
      var initialKineticEnergy = Physics.Current.lawOfConservationOfEnergy.kineticEnergy(this.attachedBody);
      this.attachedBody.applyForce(this.force, timeInterval);
      var energyUsed = Physics.Current.lawOfConservationOfEnergy.kineticEnergy(this.attachedBody) - initialKineticEnergy;
      this.energyStored -= energyUsed;
    }
  }
}

class Physics {

  static Current= new Physics();

  forceFields = [];

  principleOfInertia = {
    apply: function (bodies, timeInterval) {
      bodies.forEach(function (unforcedBody) {
        unforcedBody.moveBy(unforcedBody.momentum.timesScalar(timeInterval / unforcedBody.mass));
      });
    },

    invariant: function (universe: Universe) {
      return Vector3.sum( universe.bodies.map(b=>b.momentum) );
    }

  };

  lawOfConservationOfEnergy = {
    apply: function (bodies, timeInterval) {
      _.filter(bodies, function (body) {
        return body.engines != undefined;
      })
        .forEach(function (body) {
          (<Engine[]>body.engines).forEach(function (engine) {
            engine.applyForce(timeInterval);
          });
        });
    },

    invariant: function (universe : Universe) {
      return _.sum(universe.bodies.map(function (body) {
        var sumOfEnergyInAttachedEngines = body.engines
          ? _.sum( (<Engine[]>body.engines).map(function (e) { return e.energyStored; }) )
          : 0;
        return this.lawOfConservationOfEnergy.kineticEnergy(body) + sumOfEnergyInAttachedEngines + universe.entropy;
      }));
    },

    kineticEnergy: function (body) {
      return body.momentum.magnitudeSquared() / body.mass / 2;
    }
  };

  timeInvariants = [ this.principleOfInertia, this.lawOfConservationOfEnergy ];
}

function ReferenceFrame(bodies, physics) {
  var physics = physics || Physics.Current;
  bodies.forEach(b=>{
    b.moveBy= bodyRoot.moveBy;
    b.velocity= bodyRoot.velocity;
    b.applyForce= bodyRoot.applyForce;
  });
  this.universe = new Universe(bodies, physics);
  var time = 0;

  this.age = function (timeInterval) {
    if (timeInterval !== undefined) {
      physics.timeInvariants.forEach(function (invariant) {
        invariant.apply(bodies, timeInterval);
      });
      time += timeInterval;
    }
    return time;
  };
}
